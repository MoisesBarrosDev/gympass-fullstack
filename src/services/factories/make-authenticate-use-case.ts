import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository.js";
import { Authenticate } from "../authenticate.js";

export function makeAuthenticateUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const authenticateUseCase = new Authenticate(usersRepository);

  return authenticateUseCase
}
