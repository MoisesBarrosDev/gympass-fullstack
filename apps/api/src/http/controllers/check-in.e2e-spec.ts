import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Check-in controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should be able to check in", async () => {
    const { token } = await createAndAuthenticateUser(app);
    const gym = await prisma.gym.create({
      data: {
        title: "JavaScript Gym",
        latitude: -23.68216,
        longitude: -46.875788,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/gyms/${gym.id}/check-ins`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        userLatitude: -23.68216,
        userLongitude: -46.875788,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      checkIn: expect.objectContaining({ gym_id: gym.id }),
    });
  });

  test("should not allow an admin to check in", async () => {
    const { token } = await createAndAuthenticateUser(app, { role: "ADMIN" });
    const gym = await prisma.gym.create({
      data: {
        title: "Admin Forbidden Gym",
        latitude: -23.68216,
        longitude: -46.875788,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/gyms/${gym.id}/check-ins`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        userLatitude: -23.68216,
        userLongitude: -46.875788,
      },
    });

    expect(response.statusCode).toBe(403);
    await expect(
      prisma.checkIn.findFirst({ where: { gym_id: gym.id } }),
    ).resolves.toBeNull();
  });
});
