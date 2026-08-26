import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";

describe("Authenticate controller (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to authenticate", async () => {
    await app.inject({
      method: "POST",
      url: "/users",
      payload: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "123456",
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/sessions",
      payload: {
        email: "john.doe@example.com",
        password: "123456",
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual({
      token: expect.any(String),
    });
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["set-cookie"]).toEqual(
      expect.stringContaining("refreshToken="),
    );
    expect(response.headers["set-cookie"]).toEqual(
      expect.stringContaining("Max-Age=604800"),
    );

    const { token } = response.json<{ token: string }>();
    const payload = app.jwt.decode<{ exp: number; iat: number }>(token);
    if (!payload) throw new Error("Access token payload was not returned.");
    expect(payload.exp - payload.iat).toBe(15 * 60);

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "john.doe@example.com" },
      include: { refreshTokens: true },
    });

    expect(user.refreshTokens).toHaveLength(1);
    expect(user.refreshTokens[0]).toEqual(
      expect.objectContaining({
        revoked_at: null,
        expires_at: expect.any(Date),
      }),
    );
  });
});
