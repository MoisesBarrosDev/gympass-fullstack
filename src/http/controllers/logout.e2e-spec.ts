import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Logout controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should clear the refresh token cookie", async () => {
    const { refreshTokenCookie } = await createAndAuthenticateUser(app);

    const response = await app.inject({
      method: "POST",
      url: "/sessions/logout",
      headers: { cookie: refreshTokenCookie },
    });

    expect(response.statusCode).toBe(204);
    const setCookie = response.headers["set-cookie"];
    const clearedCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    expect(clearedCookie).toContain("refreshToken=");
    expect(clearedCookie).toContain("Max-Age=0");
    expect(clearedCookie).toContain("Path=/sessions/refresh");
  });
});
