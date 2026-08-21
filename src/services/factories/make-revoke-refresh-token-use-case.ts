import { PrismaRefreshTokensRepository } from "../../repositories/prisma/prisma-refresh-tokens-repository.js";
import { RevokeRefreshTokenUseCase } from "../revoke-refresh-token.js";

export function makeRevokeRefreshTokenUseCase() {
  const refreshTokensRepository = new PrismaRefreshTokensRepository();

  return new RevokeRefreshTokenUseCase(refreshTokensRepository);
}
