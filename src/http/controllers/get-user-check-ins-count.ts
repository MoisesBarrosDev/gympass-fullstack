import type { FastifyReply, FastifyRequest } from "fastify";
import { makeGetUserCheckInsCountUseCase } from "../../services/factories/make-get-user-check-ins-count-use-case.js";

export async function getUserCheckInsCount(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { checkInsCount } = await makeGetUserCheckInsCountUseCase().execute({
    userId: req.user.sub,
  });
  return reply.status(200).send({ checkInsCount });
}
