import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { app } from "../../app.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Search Gyms (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to search gyms", async () => {
    const { token } = await createAndAuthenticateUser(app,{ role: "ADMIN" });

    const createGymResponse = await app.inject({
      method: "POST",
      url: "/gyms",
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        title: "JavaScript Gym",
        description: "A melhor academia do Brasil",
        phone: "(99)99999-9999",
        latitude: -22.872064,
        longitude: -43.237376,
      },
    });

    expect(createGymResponse.statusCode).toEqual(201);

    const searchGymsResponse = await app.inject({
      method: "GET",
      url: "/gyms/search?query=J&page=1",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(searchGymsResponse.json()).toEqual({
      gyms: [
        expect.objectContaining({
          title: "JavaScript Gym",
        }),
      ],
    });
  });
});
