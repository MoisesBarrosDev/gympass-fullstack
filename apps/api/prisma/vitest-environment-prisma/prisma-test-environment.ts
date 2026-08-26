import "dotenv/config";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import type { Environment } from "vitest/environments";

function addSchemaToDatabaseUrl(
  databaseUrl: string | undefined,
  schema: string,
  variableName: string,
) {
  if (!databaseUrl) {
    throw new Error(`Please provide a ${variableName} environment variable.`);
  }

  const url = new URL(databaseUrl);

  url.searchParams.set("schema", schema);

  return url.toString();
}

export default <Environment>{
  name: "prisma",
  viteEnvironment: "ssr",

  setup(global) {
    const schema = randomUUID();
    const databaseUrl = addSchemaToDatabaseUrl(
      process.env.DATABASE_URL,
      schema,
      "DATABASE_URL",
    );
    const directUrl = addSchemaToDatabaseUrl(
      process.env.DIRECT_URL,
      schema,
      "DIRECT_URL",
    );

    process.env.DATABASE_URL = databaseUrl;
    process.env.DIRECT_URL = directUrl;
    process.env.NODE_ENV = "test";
    global.process.env.DATABASE_URL = databaseUrl;
    global.process.env.DIRECT_URL = directUrl;
    global.process.env.NODE_ENV = "test";

    execFileSync("npx", ["prisma", "migrate", "deploy"], {
      env: process.env,
      stdio: "ignore",
    });

    return {
      async teardown() {
        const client = new Client({ connectionString: databaseUrl });

        await client.connect();
        await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        await client.end();
      },
    };
  },
};
