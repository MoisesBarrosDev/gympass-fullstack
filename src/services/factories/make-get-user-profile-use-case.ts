import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository.js";
import { GetUserProfileUseCase } from "../get-user-profile.js";

export function makeGetUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository();

  return new GetUserProfileUseCase(usersRepository);
}
