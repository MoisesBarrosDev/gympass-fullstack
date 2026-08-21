import { PrismaRefreshTokensRepository } from "../../repositories/prisma/prisma-refresh-tokens-repository.js";
import { CreateRefreshTokenUseCase } from "../create-refresh-token.js";

export function makeCreateRefreshTokenUseCase() {
  const refreshTokensRepository = new PrismaRefreshTokensRepository();

  return new CreateRefreshTokenUseCase(refreshTokensRepository);
}
