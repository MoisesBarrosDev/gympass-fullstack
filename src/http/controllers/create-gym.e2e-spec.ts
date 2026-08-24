import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Create Gym (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to create a gym", async () => {
    const { token } = await createAndAuthenticateUser(app, { role: "ADMIN" });

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

  test.each([
    ["numeric name", { title: "11" }],
    ["short description", { description: "1" }],
    ["invalid phone", { phone: "s" }],
    ["invalid latitude", { latitude: 91 }],
    ["invalid longitude", { longitude: 181 }],
  ])("should reject %s", async (_case, invalidField) => {
    const { token } = await createAndAuthenticateUser(app, { role: "ADMIN" });

    const response = await app.inject({
      method: "POST",
      url: "/gyms",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: "JavaScript Gym",
        description: "A melhor academia do Brasil",
        phone: "(99) 99999-9999",
        latitude: -22.872064,
        longitude: -43.237376,
        ...invalidField,
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
