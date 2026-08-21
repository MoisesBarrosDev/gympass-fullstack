import type { RefreshToken } from "../generated/prisma/client.js";
import type { RefreshTokensRepository } from "../repositories/refresh-tokens-repository.js";

interface CreateRefreshTokenUseCaseRequest {
  id: string;
  userId: string;
  expiresAt: Date;
}

interface CreateRefreshTokenUseCaseResponse {
  refreshToken: RefreshToken;
}

export class CreateRefreshTokenUseCase {
  constructor(private refreshTokensRepository: RefreshTokensRepository) {}

  async execute({
    id,
    userId,
    expiresAt,
  }: CreateRefreshTokenUseCaseRequest): Promise<CreateRefreshTokenUseCaseResponse> {
    const refreshToken = await this.refreshTokensRepository.create({
      id,
      user_id: userId,
      expires_at: expiresAt,
    });

    return { refreshToken };
  }
}
