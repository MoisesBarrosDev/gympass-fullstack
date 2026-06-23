import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "../env/index.js";
import { PrismaClient } from "../generated/prisma/client.js";

export const prisma = new PrismaClient({
    log: env.NODE_ENV === 'dev' ? ['query'] : [],
  adapter: new PrismaPg({
    connectionString: env.DATABASE_URL,
  }),
});
