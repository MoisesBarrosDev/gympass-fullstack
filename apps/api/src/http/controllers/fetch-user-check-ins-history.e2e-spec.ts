import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Fetch user check-ins history controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should be able to fetch the user check-ins history", async () => {
    const email = "history@example.com";
    const { token } = await createAndAuthenticateUser(app, { email });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const gym = await prisma.gym.create({
      data: { title: "History Gym", latitude: -23.68216, longitude: -46.875788 },
    });
    await prisma.checkIn.create({
      data: { user_id: user.id, gym_id: gym.id },
    });

    const response = await app.inject({
      method: "GET",
      url: "/check-ins/history?page=1",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().checkIns).toEqual([
      expect.objectContaining({ user_id: user.id, gym_id: gym.id }),
    ]);
  });
});
