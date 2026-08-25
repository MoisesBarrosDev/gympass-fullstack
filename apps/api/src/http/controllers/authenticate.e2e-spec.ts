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
    expect(response.headers["set-cookie"]).toEqual(
      expect.stringContaining("refreshToken="),
    );

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
