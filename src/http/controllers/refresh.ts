import type { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { env } from "../../env/index.js";

export async function refresh(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify({ onlyCookie: true });// ela vai verificar se o token de refresh está presente no cookie e se é válido

    if (req.user.type !== "refresh") {
      return reply.status(401).send({ message: "Invalid refresh token." });
    }

    const token = await reply.jwtSign(
      { type: "access" },
      {
        sign: {
          sub: req.user.sub,
          expiresIn: "10m",
        },
      },
    );

    const refreshToken = await reply.jwtSign(
      { type: "refresh", jti: randomUUID() },
      {
        sign: {
          sub: req.user.sub,
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
  } catch {
    return reply.status(401).send({ message: "Invalid refresh token." });
  }
}
