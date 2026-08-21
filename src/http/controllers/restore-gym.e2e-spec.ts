import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Restore gym controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should be able to restore a gym", async () => {
    const { token } = await createAndAuthenticateUser(app,{ role: "ADMIN" });
    const gym = await prisma.gym.create({
      data: {
        title: "Deleted Gym",
        latitude: -23.68216,
        longitude: -46.875788,
        deleted_at: new Date(),
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/gyms/${gym.id}/restore`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().gym).toEqual(
      expect.objectContaining({ id: gym.id, deleted_at: null }),
    );
  });
});
