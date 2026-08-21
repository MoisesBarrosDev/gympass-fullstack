import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryRefreshTokensRepository } from "../repositories/in-memory/in-memory-refresh-tokens-repository.js";
import { RevokeRefreshTokenUseCase } from "./revoke-refresh-token.js";

let refreshTokensRepository: InMemoryRefreshTokensRepository;
let sut: RevokeRefreshTokenUseCase;

describe("Revoke Refresh Token Use Case", () => {
  beforeEach(() => {
    refreshTokensRepository = new InMemoryRefreshTokensRepository();
    sut = new RevokeRefreshTokenUseCase(refreshTokensRepository);
  });

  test("should revoke a refresh token", async () => {
    await refreshTokensRepository.create({
      id: "refresh-token-id",
      user_id: "user-id",
      expires_at: new Date(Date.now() + 60_000),
    });

    const { revoked } = await sut.execute({ id: "refresh-token-id" });

    expect(revoked).toBe(true);
    expect(refreshTokensRepository.items[0]?.revoked_at).toEqual(
      expect.any(Date),
    );
  });
});
