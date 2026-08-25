import { prisma } from "../../lib/prisma.js";
import type {
  CreateRefreshTokenData,
  RefreshTokensRepository,
  RotateRefreshTokenData,
} from "../refresh-tokens-repository.js";

export class PrismaRefreshTokensRepository
  implements RefreshTokensRepository
{
  async create(data: CreateRefreshTokenData) {
    return prisma.refreshToken.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.refreshToken.findUnique({
      where: {
        id,
      },
    });
  }

  async rotate({ currentTokenId, newToken }: RotateRefreshTokenData) {
    return prisma.$transaction(async (transaction) => {
      const revokedToken = await transaction.refreshToken.updateMany({
        where: {
          id: currentTokenId,
          user_id: newToken.user_id,
          revoked_at: null,
          expires_at: {
            gt: new Date(),
          },
        },
        data: {
          revoked_at: new Date(),
        },
      });

      if (revokedToken.count === 0) {
        return null;
      }

      return transaction.refreshToken.create({
        data: newToken,
      });
    });
  }

  async revokeById(id: string) {
    const result = await prisma.refreshToken.updateMany({
      where: {
        id,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });

    return result.count > 0;
  }
}
