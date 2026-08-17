import "dotenv/config";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import type { Environment } from "vitest/environments";

function generateDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error("Please provide a DATABASE_URL environment variable.");
  }

  const url = new URL(process.env.DATABASE_URL);

  url.searchParams.set("schema", schema);

  return url.toString();
}

export default <Environment>{
  name: "prisma",
  viteEnvironment: "ssr",

  setup(global) {
    const schema = randomUUID();
    const databaseUrl = generateDatabaseUrl(schema);

    process.env.DATABASE_URL = databaseUrl;
    process.env.NODE_ENV = "test";
    global.process.env.DATABASE_URL = databaseUrl;
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
