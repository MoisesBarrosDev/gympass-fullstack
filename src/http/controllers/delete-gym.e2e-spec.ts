import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Delete gym controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should be able to delete a gym", async () => {
    const { token } = await createAndAuthenticateUser(app,{ role: "ADMIN" });
    const gym = await prisma.gym.create({
      data: { title: "Gym to delete", latitude: -23.68216, longitude: -46.875788 },
    });

    const response = await app.inject({
      method: "DELETE",
      url: `/gyms/${gym.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(204);
    const deletedGym = await prisma.gym.findUniqueOrThrow({
      where: { id: gym.id },
    });
    expect(deletedGym.deleted_at).toEqual(expect.any(Date));
  });
});
