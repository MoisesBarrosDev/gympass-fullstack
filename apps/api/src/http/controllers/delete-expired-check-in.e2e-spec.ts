import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Delete expired check-in controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should allow an admin to delete an expired check-in", async () => {
    const { token } = await createAndAuthenticateUser(app, { role: "ADMIN" });
    const memberEmail = "delete-expired-member@example.com";
    await createAndAuthenticateUser(app, { email: memberEmail });
    const member = await prisma.user.findUniqueOrThrow({
      where: { email: memberEmail },
    });
    const gym = await prisma.gym.create({
      data: {
        title: "Delete Expired Gym",
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
      method: "DELETE",
      url: `/check-ins/expired/${checkIn.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(204);
    await expect(
      prisma.checkIn.findUnique({ where: { id: checkIn.id } }),
    ).resolves.toBeNull();
  });
});
