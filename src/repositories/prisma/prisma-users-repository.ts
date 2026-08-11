import type { UserCreateInput } from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import type { UsersRepository } from "../users-repository.js";

export class PrismaUsersRepository implements UsersRepository {
  async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async createUser({ name, email, password_hash }: UserCreateInput) {
    return await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
      },
    });
  }
}
