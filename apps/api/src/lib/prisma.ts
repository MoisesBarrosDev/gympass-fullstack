import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "../env/index.js";
import { PrismaClient } from "../generated/prisma/client.js";

const databaseUrl = new URL(env.DATABASE_URL);
const schema = databaseUrl.searchParams.get("schema") ?? "public";

export const prisma = new PrismaClient({
  log: env.NODE_ENV === "dev" ? ["query"] : [],
  adapter: new PrismaPg(
    {
      connectionString: env.DATABASE_URL,
      options: `-c search_path="${schema}"`,
    },
    {
      schema,
    },
  ),
});
