import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";

describe("Profile controller (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to view profile", async () => {
    await app.inject({
      method: "POST",
      url: "/users",
      payload: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "123456",
      },
    });

    const authResponse = await app.inject({
      method: "POST",
      url: "/sessions",
      payload: {
        email: "john.doe@example.com",
        password: "123456",
      },
    });

    const { token } = authResponse.json<{ token: string }>();

    const profileResponse = await app.inject({
      method: "GET",
      url: "/me",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(profileResponse.statusCode).toEqual(200);
    expect(profileResponse.json()).toEqual(
      expect.objectContaining({
        name: "John Doe",
        email: "john.doe@example.com",
      }),
    );
  });
});
