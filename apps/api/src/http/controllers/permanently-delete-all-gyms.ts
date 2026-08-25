import type { FastifyReply, FastifyRequest } from "fastify";
import { makePermanentlyDeleteAllGymsUseCase } from "../../services/factories/make-permanently-delete-all-gyms-use-case.js";

export async function permanentlyDeleteAllGyms(
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  const { count } = await makePermanentlyDeleteAllGymsUseCase().execute();

  return reply.status(200).send({ count });
}
