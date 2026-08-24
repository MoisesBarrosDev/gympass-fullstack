import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Fetch expired check-ins controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should allow an admin to fetch expired check-ins", async () => {
    const { token } = await createAndAuthenticateUser(app, { role: "ADMIN" });
    const memberEmail = "expired-member@example.com";
    await createAndAuthenticateUser(app, { email: memberEmail });
    const member = await prisma.user.findUniqueOrThrow({
      where: { email: memberEmail },
    });
    const gym = await prisma.gym.create({
      data: {
        title: "Expired Gym",
        latitude: -22.874978,
        longitude: -43.242469,
      },
    });
    const checkIn = await prisma.checkIn.create({
      data: {
        user_id: member.id,
        gym_id: gym.id,
        created_at: new Date(Date.now() - 21 * 60 * 1000),
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/check-ins/expired?page=1",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      checkIns: [
        expect.objectContaining({
          id: checkIn.id,
          user: expect.objectContaining({ name: member.name, email: member.email }),
          gym: expect.objectContaining({ title: gym.title }),
        }),
      ],
    });
  });
});
