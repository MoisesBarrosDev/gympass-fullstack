import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Get user check-ins count controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should be able to get the user check-ins count", async () => {
    const email = "metrics@example.com";
    const { token } = await createAndAuthenticateUser(app, { email });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const gym = await prisma.gym.create({
      data: { title: "Metrics Gym", latitude: -23.68216, longitude: -46.875788 },
    });
    await prisma.checkIn.createMany({
      data: [
        { user_id: user.id, gym_id: gym.id },
        { user_id: user.id, gym_id: gym.id },
      ],
    });

    const response = await app.inject({
      method: "GET",
      url: "/check-ins/metrics",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ checkInsCount: 2 });
  });
});
