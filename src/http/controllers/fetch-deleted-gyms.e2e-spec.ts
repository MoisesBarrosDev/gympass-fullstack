import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";
import { createAndAuthenticateUser } from "../middlewares/create-and-authenticate-user.js";

describe("Fetch deleted gyms controller (E2E)", () => {
  beforeAll(async () => app.ready());
  afterAll(async () => app.close());

  test("should list deleted gyms for an administrator", async () => {
    const { token } = await createAndAuthenticateUser(app, { role: "ADMIN" });
    await prisma.gym.create({
      data: {
        title: "Deleted Gym",
        phone: "(99) 99999-9999",
        latitude: -22.9,
        longitude: -43.2,
        deleted_at: new Date(),
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/gyms/deleted?page=1",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().gyms).toEqual([
      expect.objectContaining({ title: "Deleted Gym" }),
    ]);
  });
});
