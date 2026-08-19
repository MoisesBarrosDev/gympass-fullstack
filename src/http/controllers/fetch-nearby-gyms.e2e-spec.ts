import { describe, test, beforeAll, afterAll, expect } from "vitest";
import { app } from "../../app.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Fetch Nearby Gyms (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to fetch nearby gyms", async () => {
    const { token } = await createAndAuthenticateUser(app);

    const gym = await app.inject({
      method: "GET",
      url: "/gyms/nearby?userLatitude=-23.682160&userLongitude=-46.875788",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(gym.statusCode).toEqual(200);
  });
});
