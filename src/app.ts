import fastify from "fastify";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env/index.js";

export const app = fastify();

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

await prisma.user.create({
  data: {
    name: "Moisés Barros",
    email: "moisesbarros@gmail.com",
  },
});

