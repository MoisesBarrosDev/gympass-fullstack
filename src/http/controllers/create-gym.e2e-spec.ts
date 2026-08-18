import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";

describe("Create Gym (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to create a gym", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "123456",
      },
    });

    expect(response.statusCode).toEqual(201);

    const user = await prisma.user.findUnique({
      where: {
        email: "john.doe@example.com",
      },
    });

    expect(user).toEqual(
      expect.objectContaining({
        name: "John Doe",
        email: "john.doe@example.com",
      }),
    );

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

    const gym = await app.inject({
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
    expect(gym.statusCode).toEqual(201);
  });
});
