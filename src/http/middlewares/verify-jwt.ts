import type { FastifyReply, FastifyRequest } from "fastify";

export async function verifyJWT(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await req.jwtVerify();

    if (req.user.type !== "access") {
      return reply.status(401).send({
        message: "Unauthorized.",
      });
    }
  } catch {
    return reply.status(401).send({
      message: "Unauthorized.",
    });
  }
}
