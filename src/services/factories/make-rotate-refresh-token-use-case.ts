import { PrismaRefreshTokensRepository } from "../../repositories/prisma/prisma-refresh-tokens-repository.js";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository.js";
import { RotateRefreshTokenUseCase } from "../rotate-refresh-token.js";

export function makeRotateRefreshTokenUseCase() {
  const refreshTokensRepository = new PrismaRefreshTokensRepository();
  const usersRepository = new PrismaUsersRepository();

  return new RotateRefreshTokenUseCase(
    refreshTokensRepository,
    usersRepository,
  );
}
