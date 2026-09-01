import "dotenv/config";

import { createHash } from "node:crypto";
import { z } from "zod";

const COMPROMISED_JWT_SECRET_SHA256 = new Set([
  "230efcfef80a624cf389fc4d44a5e985692c8cd84395c6cd823608c4f319277e",
]);

const PUBLIC_JWT_SECRET_VALUES = new Set([
  "testing",
  "replace-with-a-long-random-secret",
]);

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["dev", "test", "production"]),
    JWT_SECRET: z.string().min(1),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.string().url(),
  })
  .superRefine(({ JWT_SECRET, NODE_ENV }, context) => {
    if (NODE_ENV !== "production") return;

    const secretHash = createHash("sha256").update(JWT_SECRET).digest("hex");
    const isPublicValue =
      PUBLIC_JWT_SECRET_VALUES.has(JWT_SECRET) ||
      JWT_SECRET.startsWith("generate-") ||
      COMPROMISED_JWT_SECRET_SHA256.has(secretHash);

    if (JWT_SECRET.length < 64 || isPublicValue) {
      context.addIssue({
        code: "custom",
        path: ["JWT_SECRET"],
        message:
          "JWT_SECRET must be a unique random value with at least 64 characters in production.",
      });
    }
  });

export function parseEnv(input: NodeJS.ProcessEnv) {
  return envSchema.parse(input);
}

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.log("Invalid environment variables", _env.error.format());

  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
