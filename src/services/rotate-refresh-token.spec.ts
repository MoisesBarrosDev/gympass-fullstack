import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryRefreshTokensRepository } from "../repositories/in-memory/in-memory-refresh-tokens-repository.js";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository.js";
import { InvalidRefreshTokenError } from "./errors/invalid-refresh-token-error.js";
import { RotateRefreshTokenUseCase } from "./rotate-refresh-token.js";

let refreshTokensRepository: InMemoryRefreshTokensRepository;
let usersRepository: InMemoryUsersRepository;
let sut: RotateRefreshTokenUseCase;

describe("Rotate Refresh Token Use Case", () => {
  beforeEach(() => {
    refreshTokensRepository = new InMemoryRefreshTokensRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new RotateRefreshTokenUseCase(
      refreshTokensRepository,
      usersRepository,
    );
  });

  test("should revoke the current token and create a new one", async () => {
    const user = await usersRepository.createUser({
      name: "John Doe",
      email: "john@example.com",
      password_hash: "password-hash",
    });
    await refreshTokensRepository.create({
      id: "current-token-id",
      user_id: user.id,
      expires_at: new Date(Date.now() + 60_000),
    });

    const { refreshToken } = await sut.execute({
      currentTokenId: "current-token-id",
      newTokenId: "new-token-id",
      userId: user.id,
      expiresAt: new Date(Date.now() + 120_000),
    });

    expect(refreshToken.id).toBe("new-token-id");
    expect(refreshToken.revoked_at).toBeNull();
    expect(refreshTokensRepository.items[0]?.revoked_at).toEqual(
      expect.any(Date),
    );
  });

  test("should reject reuse of a revoked refresh token", async () => {
    const user = await usersRepository.createUser({
      name: "John Doe",
      email: "john@example.com",
      password_hash: "password-hash",
    });
    await refreshTokensRepository.create({
      id: "current-token-id",
      user_id: user.id,
      expires_at: new Date(Date.now() + 60_000),
    });

    await sut.execute({
      currentTokenId: "current-token-id",
      newTokenId: "first-new-token-id",
      userId: user.id,
      expiresAt: new Date(Date.now() + 120_000),
    });

    await expect(
      sut.execute({
        currentTokenId: "current-token-id",
        newTokenId: "second-new-token-id",
        userId: user.id,
        expiresAt: new Date(Date.now() + 120_000),
      }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  test("should reject an expired refresh token", async () => {
    const user = await usersRepository.createUser({
      name: "John Doe",
      email: "john@example.com",
      password_hash: "password-hash",
    });
    await refreshTokensRepository.create({
      id: "expired-token-id",
      user_id: user.id,
      expires_at: new Date(Date.now() - 60_000),
    });

    await expect(
      sut.execute({
        currentTokenId: "expired-token-id",
        newTokenId: "new-token-id",
        userId: user.id,
        expiresAt: new Date(Date.now() + 120_000),
      }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });
});
