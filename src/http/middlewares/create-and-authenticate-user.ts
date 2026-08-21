import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";

interface CreateAndAuthenticateUserOptions {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "MEMBER";
}

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  options: CreateAndAuthenticateUserOptions = {},
) {
  const name = options.name ?? "John Doe";
  const email = options.email ?? "john.doe@example.com";
  const password = options.password ?? "123456";

  await app.inject({
    method: "POST",
    url: "/users",
    payload: { name, email, password },
  });

  if (options.role) {
    await prisma.user.update({
      where: { email },
      data: { role: options.role },
    });
  }

  const authResponse = await app.inject({
    method: "POST",
    url: "/sessions",
    payload: { email, password },
  });

  const { token } = authResponse.json<{ token: string }>();
  const setCookie = authResponse.headers["set-cookie"];
  const serializedCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const refreshTokenCookie = serializedCookie?.split(";")[0];

  if (!refreshTokenCookie) {
    throw new Error("Refresh token cookie was not returned by authentication.");
  }

  return { token, refreshTokenCookie };
}
