import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryRefreshTokensRepository } from "../repositories/in-memory/in-memory-refresh-tokens-repository.js";
import { CreateRefreshTokenUseCase } from "./create-refresh-token.js";

let refreshTokensRepository: InMemoryRefreshTokensRepository;
let sut: CreateRefreshTokenUseCase;

describe("Create Refresh Token Use Case", () => {
  beforeEach(() => {
    refreshTokensRepository = new InMemoryRefreshTokensRepository();
    sut = new CreateRefreshTokenUseCase(refreshTokensRepository);
  });

  test("should persist a refresh token session", async () => {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { refreshToken } = await sut.execute({
      id: "refresh-token-id",
      userId: "user-id",
      expiresAt,
    });

    expect(refreshToken).toEqual(
      expect.objectContaining({
        id: "refresh-token-id",
        user_id: "user-id",
        expires_at: expiresAt,
        revoked_at: null,
      }),
    );
    expect(refreshTokensRepository.items).toHaveLength(1);
  });
});
