import { describe, test, expect } from "vitest";
import { app } from "../../app.js";

describe("Fetch Gyms (e2e)", () => {
  test("should be able to fetch gyms", async () => {
    const user = await app.inject({
      method: "POST",
      url: "/users",
      payload: {
        name: "John Doe",
        email: "jhondoe@gamil.com",
        password: "123456",
      },
    });

    expect(user.statusCode).toEqual(201);

    const authResponse = await app.inject({
      method: "POST",
      url: "/sessions",
      payload: {
        email: "jhondoe@gamil.com",
        password: "123456",
      },
    });
    expect(authResponse.statusCode).toEqual(200);

    const { token } = authResponse.json<{ token: string }>();

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
