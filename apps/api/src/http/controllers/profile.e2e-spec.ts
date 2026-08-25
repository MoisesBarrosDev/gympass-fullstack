import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Profile controller (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to view profile", async () => {
    const { token } = await createAndAuthenticateUser(app);

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
