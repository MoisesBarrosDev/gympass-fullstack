import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { app } from "../../app.js";

describe("Search Gyms (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to search gyms", async () => {
    const user = await app.inject({
      method: "POST",
      url: "/users",
      payload: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "123456",
      },
    });

    expect(user.statusCode).toEqual(201);

    const authResponse = await app.inject({
      method: "POST",
      url: "/sessions",
      payload: {
        email: "john.doe@example.com",
        password: "123456",
      },
    });

    const { token } = authResponse.json<{ token: string }>();

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
      url: "/gyms/search?query=JavaScript&page=1",
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
