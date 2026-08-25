import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Permanently delete gym controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should permanently delete a gym and its check-ins", async () => {
    const email = "permanent-delete-admin@example.com";
    const { token } = await createAndAuthenticateUser(app, {
      email,
      role: "ADMIN",
    });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const gym = await prisma.gym.create({
      data: {
        title: "Deleted Gym",
        description: "A gym waiting for permanent deletion",
        phone: "(99) 99999-9999",
        latitude: -23.68216,
        longitude: -46.875788,
        deleted_at: new Date(),
      },
    });
    const checkIn = await prisma.checkIn.create({
      data: { gym_id: gym.id, user_id: user.id },
    });

    const response = await app.inject({
      method: "DELETE",
      url: `/gyms/${gym.id}/permanent`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(204);
    expect(await prisma.gym.findUnique({ where: { id: gym.id } })).toBeNull();
    expect(
      await prisma.checkIn.findUnique({ where: { id: checkIn.id } }),
    ).toBeNull();
  });

  test("should permanently delete all soft-deleted gyms", async () => {
    const email = "permanent-delete-all-admin@example.com";
    const { token } = await createAndAuthenticateUser(app, {
      email,
      role: "ADMIN",
    });
    await prisma.gym.createMany({
      data: [
        {
          title: "Deleted Gym One",
          latitude: -23.68216,
          longitude: -46.875788,
          deleted_at: new Date(),
        },
        {
          title: "Deleted Gym Two",
          latitude: -23.68216,
          longitude: -46.875788,
          deleted_at: new Date(),
        },
      ],
    });
    const activeGym = await prisma.gym.create({
      data: {
        title: "Active Gym",
        latitude: -23.68216,
        longitude: -46.875788,
      },
    });

    const response = await app.inject({
      method: "DELETE",
      url: "/gyms/deleted/permanent",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ count: 2 });
    expect(await prisma.gym.count({ where: { deleted_at: { not: null } } })).toBe(
      0,
    );
    expect(await prisma.gym.findUnique({ where: { id: activeGym.id } })).not.toBeNull();
  });
});
