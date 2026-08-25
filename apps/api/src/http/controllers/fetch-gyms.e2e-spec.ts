import { afterAll, beforeAll, describe, test, expect } from "vitest";
import { app } from "../../app.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Fetch Gyms (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to fetch gyms", async () => {
    const { token } = await createAndAuthenticateUser(app);

    const gym = await app.inject({
      method: "GET",
      url: "/gyms",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    expect(gym.statusCode).toEqual(200);
  });
});
