import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Get all validated check-ins count controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should return the global validated count to an admin", async () => {
    const { token } = await createAndAuthenticateUser(app, { role: "ADMIN" });
    const memberEmail = "global-metrics-member@example.com";
    await createAndAuthenticateUser(app, { email: memberEmail });
    const member = await prisma.user.findUniqueOrThrow({
      where: { email: memberEmail },
    });
    const gym = await prisma.gym.create({
      data: {
        title: "Global Metrics Gym",
        latitude: -22.874978,
        longitude: -43.242469,
      },
    });
    await prisma.checkIn.createMany({
      data: [
        { user_id: member.id, gym_id: gym.id, validated_at: new Date() },
        { user_id: member.id, gym_id: gym.id },
      ],
    });

    const response = await app.inject({
      method: "GET",
      url: "/check-ins/metrics/global",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ checkInsCount: 1 });
  });
});
