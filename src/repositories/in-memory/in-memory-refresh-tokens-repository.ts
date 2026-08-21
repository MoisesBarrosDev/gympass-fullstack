import type { RefreshToken } from "../../generated/prisma/client.js";
import type {
  CreateRefreshTokenData,
  RefreshTokensRepository,
  RotateRefreshTokenData,
} from "../refresh-tokens-repository.js";

export class InMemoryRefreshTokensRepository
  implements RefreshTokensRepository
{
  public items: RefreshToken[] = [];

  async create(data: CreateRefreshTokenData) {
    const refreshToken: RefreshToken = {
      id: data.id,
      user_id: data.user_id,
      expires_at: data.expires_at,
      revoked_at: null,
      created_at: new Date(),
    };

    this.items.push(refreshToken);

    return refreshToken;
  }

  async findById(id: string) {
    return this.items.find((refreshToken) => refreshToken.id === id) ?? null;
  }

  async rotate({ currentTokenId, newToken }: RotateRefreshTokenData) {
    const currentToken = this.items.find(
      (item) =>
        item.id === currentTokenId &&
        item.user_id === newToken.user_id &&
        item.revoked_at === null &&
        item.expires_at > new Date(),
    );

    if (!currentToken) {
      return null;
    }

    currentToken.revoked_at = new Date();

    return this.create(newToken);
  }

  async revokeById(id: string) {
    const refreshToken = this.items.find(
      (item) => item.id === id && item.revoked_at === null,
    );

    if (!refreshToken) {
      return false;
    }

    refreshToken.revoked_at = new Date();

    return true;
  }
}
