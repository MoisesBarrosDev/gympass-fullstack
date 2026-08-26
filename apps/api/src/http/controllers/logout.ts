import type { FastifyReply, FastifyRequest } from "fastify";
import { makeRevokeRefreshTokenUseCase } from "../../services/factories/make-revoke-refresh-token-use-case.js";

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify({ onlyCookie: true });

    if (req.user.type === "refresh" && req.user.jti) {
      await makeRevokeRefreshTokenUseCase().execute({
        id: req.user.jti,
      });
    }
  } catch {
  }

  return reply
    .header("Cache-Control", "no-store")
    .clearCookie("refreshToken", {
      path: "/",
    })
    .status(204)
    .send();
}
