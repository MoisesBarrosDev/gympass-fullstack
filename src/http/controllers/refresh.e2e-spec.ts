import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Refresh token controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should issue new access and refresh tokens", async () => {
    const { refreshTokenCookie } = await createAndAuthenticateUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/sessions/refresh",
      headers: { cookie: refreshTokenCookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ token: expect.any(String) });

    const setCookie = response.headers["set-cookie"];
    const newCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    expect(newCookie).toContain("refreshToken=");
    expect(newCookie).toContain("HttpOnly");
    expect(newCookie).toContain("SameSite=Strict");
    expect(newCookie).toContain("Path=/sessions/refresh");
    expect(newCookie?.split(";")[0]).not.toBe(refreshTokenCookie);
  });

  test("should reject an access token as a refresh token", async () => {
    const { token } = await createAndAuthenticateUser(app, {
      email: "access-as-refresh@example.com",
    });

    const response = await app.inject({
      method: "POST",
      url: "/sessions/refresh",
      headers: { cookie: `refreshToken=${token}` },
    });

    expect(response.statusCode).toBe(401);
  });

  test("should reject a refresh token on protected routes", async () => {
    const { refreshTokenCookie } = await createAndAuthenticateUser(app, {
      email: "refresh-as-access@example.com",
    });

    const response = await app.inject({
      method: "GET",
      url: "/me",
      headers: { cookie: refreshTokenCookie },
    });

    expect(response.statusCode).toBe(401);
  });
});
