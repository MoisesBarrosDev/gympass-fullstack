import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { app } from "../../app.js";
import { prisma } from "../../lib/prisma.js";

describe("Register controller (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to register", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "123456",
      },
    });

    expect(response.statusCode).toEqual(201);

    const user = await prisma.user.findUnique({
      where: {
        email: "john.doe@example.com",
      },
    });

    expect(user).toEqual(
      expect.objectContaining({
        name: "John Doe",
        email: "john.doe@example.com",
      }),
    );
  });
});
