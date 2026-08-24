import type { FastifyReply, FastifyRequest } from "fastify";
import { makeGetAllValidatedCheckInsCountUseCase } from "../../services/factories/make-get-all-validated-check-ins-count-use-case.js";

export async function getAllValidatedCheckInsCount(
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  const { checkInsCount } =
    await makeGetAllValidatedCheckInsCountUseCase().execute();

  return reply.status(200).send({ checkInsCount });
}
