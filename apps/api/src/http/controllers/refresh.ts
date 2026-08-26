import type { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { env } from "../../env/index.js";
import { makeRotateRefreshTokenUseCase } from "../../services/factories/make-rotate-refresh-token-use-case.js";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  getRefreshTokenExpiresAt,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_MAX_AGE,
} from "../auth-config.js";

export async function refresh(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify({ onlyCookie: true });

    if (req.user.type !== "refresh" || !req.user.jti) {
      return reply.status(401).send({ message: "Invalid refresh token." });
    }

    const newRefreshTokenId = randomUUID();
    const refreshTokenExpiresAt = getRefreshTokenExpiresAt();

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
          expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        },
      },
    );

    const refreshToken = await reply.jwtSign(
      { type: "refresh", jti: newRefreshTokenId, role: user.role },
      {
        sign: {
          sub: req.user.sub,
          expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        },
      },
    );

    return reply
      .header("Cache-Control", "no-store")
      .setCookie("refreshToken", refreshToken, {
        path: "/",
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        httpOnly: true,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      })
      .status(200)
      .send({ token });
  } catch {
    return reply.status(401).send({ message: "Invalid refresh token." });
  }
}
