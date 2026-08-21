import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Validate check-in controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should be able to validate a check-in", async () => {
    const email = "validation@example.com";
    const { token } = await createAndAuthenticateUser(app, { email, role: "ADMIN" });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const gym = await prisma.gym.create({
      data: { title: "Validation Gym", latitude: -23.68216, longitude: -46.875788 },
    });
    const checkIn = await prisma.checkIn.create({
      data: { user_id: user.id, gym_id: gym.id },
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/check-ins/${checkIn.id}/validate`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(204);
    const validatedCheckIn = await prisma.checkIn.findUniqueOrThrow({
      where: { id: checkIn.id },
    });
    expect(validatedCheckIn.validated_at).toEqual(expect.any(Date));
  });
});
