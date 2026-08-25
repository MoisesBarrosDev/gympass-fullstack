import type { RefreshTokensRepository } from "../repositories/refresh-tokens-repository.js";

interface RevokeRefreshTokenUseCaseRequest {
  id: string;
}

interface RevokeRefreshTokenUseCaseResponse {
  revoked: boolean;
}

export class RevokeRefreshTokenUseCase {
  constructor(private refreshTokensRepository: RefreshTokensRepository) {}

  async execute({
    id,
  }: RevokeRefreshTokenUseCaseRequest): Promise<RevokeRefreshTokenUseCaseResponse> {
    const revoked = await this.refreshTokensRepository.revokeById(id);

    return { revoked };
  }
}
