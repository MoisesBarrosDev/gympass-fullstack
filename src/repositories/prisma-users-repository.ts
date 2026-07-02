import type { UserCreateInput } from "../generated/prisma/models.js";
import { prisma } from "../lib/prisma.js";

export class PrismaUsersRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  async create({ name, email, password_hash }: UserCreateInput) {
    await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
      },
    });
  }
}
