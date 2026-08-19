import type { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { env } from "../../env/index.js";
import { InvalidCredentialsError } from "../../services/errors/invalid-credential-error.js";
import { makeAuthenticateUseCase } from "../../services/factories/make-authenticate-use-case.js";

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const { email, password } = authenticateBodySchema.parse(req.body);

  try {
    const authenticateUseCase = makeAuthenticateUseCase();

    const { user } = await authenticateUseCase.execute({ email, password });

    const token = await reply.jwtSign(
      { type: "access" },
      {
        sign: {
          sub: user.id,
          expiresIn: "10m",
        },
      },
    );

    const refreshToken = await reply.jwtSign(
      { type: "refresh", jti: randomUUID() },
      {
        sign: {
          sub: user.id,
          expiresIn: "1d",
        },
      },
    );

    return reply
      .setCookie("refreshToken", refreshToken, {
        path: "/sessions/refresh",
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        httpOnly: true,
        maxAge: 60 * 60 * 24,
      })
      .status(200)
      .send({ token });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: error.message });
    }

    throw error;
  }
}
