import type { FastifyReply, FastifyRequest } from "fastify";

export async function logout(_req: FastifyRequest, reply: FastifyReply) {
  return reply
    .clearCookie("refreshToken", {
      path: "/sessions/refresh",
    })
    .status(204)
    .send();
}
