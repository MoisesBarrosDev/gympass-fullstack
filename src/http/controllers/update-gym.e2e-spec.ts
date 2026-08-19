import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Update gym controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should be able to update a gym", async () => {
    const { token } = await createAndAuthenticateUser(app);
    const gym = await prisma.gym.create({
      data: { title: "Old Gym", latitude: -23.68216, longitude: -46.875788 },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/gyms/${gym.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Updated Gym" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().gym).toEqual(
      expect.objectContaining({ id: gym.id, title: "Updated Gym" }),
    );
  });
});
