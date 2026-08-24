import type { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { env } from "../../env/index.js";
import { makeRotateRefreshTokenUseCase } from "../../services/factories/make-rotate-refresh-token-use-case.js";

export async function refresh(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify({ onlyCookie: true });

    if (req.user.type !== "refresh" || !req.user.jti) {
      return reply.status(401).send({ message: "Invalid refresh token." });
    }

    const newRefreshTokenId = randomUUID();
    const refreshTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { user } = await makeRotateRefreshTokenUseCase().execute({
      currentTokenId: req.user.jti,
      newTokenId: newRefreshTokenId,
      userId: req.user.sub,
      expiresAt: refreshTokenExpiresAt,
    });

    const token = await reply.jwtSign(
      { type: "access", role: user.role },
      {
        sign: {
          sub: req.user.sub,
          expiresIn: "1d",
        },
      },
    );

    const refreshToken = await reply.jwtSign(
      { type: "refresh", jti: newRefreshTokenId, role: user.role },
      {
        sign: {
          sub: req.user.sub,
          expiresIn: "1d",
        },
      },
    );

    return reply
      .setCookie("refreshToken", refreshToken, {
        path: "/sessions",
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
