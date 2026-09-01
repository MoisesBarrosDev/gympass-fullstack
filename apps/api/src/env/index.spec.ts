import { describe, expect, test } from "vitest";
import { parseEnv } from "./index.js";

const databaseUrl = "postgresql://user:password@localhost:5432/gympass";

describe("environment security", () => {
  test("should require an explicit environment", () => {
    expect(() =>
      parseEnv({
        JWT_SECRET: "testing",
        DATABASE_URL: databaseUrl,
      }),
    ).toThrow();
  });

  test.each([
    "short-secret",
    "testing",
    "replace-with-a-long-random-secret",
    `generate-${"a".repeat(70)}`,
  ])("should reject a public or weak production JWT secret: %s", (JWT_SECRET) => {
    expect(() =>
      parseEnv({
        NODE_ENV: "production",
        JWT_SECRET,
        DATABASE_URL: databaseUrl,
      }),
    ).toThrow();
  });

  test("should accept a long unique production JWT secret", () => {
    expect(
      parseEnv({
        NODE_ENV: "production",
        JWT_SECRET:
          "4ad1575c0b60f3267c02bcbd001864b8b94c9729c014c8ed43e52a8a1230f9cb",
        DATABASE_URL: databaseUrl,
      }).JWT_SECRET,
    ).toHaveLength(64);
  });

  test("should allow the isolated test secret outside production", () => {
    expect(
      parseEnv({
        NODE_ENV: "test",
        JWT_SECRET: "testing",
        DATABASE_URL: databaseUrl,
      }).JWT_SECRET,
    ).toBe("testing");
  });
});
