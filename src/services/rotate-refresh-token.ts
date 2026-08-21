import type { RefreshToken, User } from "../generated/prisma/client.js";
import type { RefreshTokensRepository } from "../repositories/refresh-tokens-repository.js";
import type { UsersRepository } from "../repositories/users-repository.js";
import { InvalidRefreshTokenError } from "./errors/invalid-refresh-token-error.js";

interface RotateRefreshTokenUseCaseRequest {
  currentTokenId: string;
  newTokenId: string;
  userId: string;
  expiresAt: Date;
}

interface RotateRefreshTokenUseCaseResponse {
  refreshToken: RefreshToken;
  user: User;
}

export class RotateRefreshTokenUseCase {
  constructor(
    private refreshTokensRepository: RefreshTokensRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    currentTokenId,
    newTokenId,
    userId,
    expiresAt,
  }: RotateRefreshTokenUseCaseRequest): Promise<RotateRefreshTokenUseCaseResponse> {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    const refreshToken = await this.refreshTokensRepository.rotate({
      currentTokenId,
      newToken: {
        id: newTokenId,
        user_id: user.id,
        expires_at: expiresAt,
      },
    });

    if (!refreshToken) {
      throw new InvalidRefreshTokenError();
    }

    return { refreshToken, user };
  }
}
