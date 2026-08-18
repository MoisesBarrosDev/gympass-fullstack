import type { FastifyReply, FastifyRequest } from "fastify";
import { makeFetchGymsUseCase } from "../../services/factories/make-fetch-gyms-use-case.js";

export async function fetchGyms(_req: FastifyRequest, reply: FastifyReply) {
  const fetchGymsUseCase = makeFetchGymsUseCase();

  const { gyms } = await fetchGymsUseCase.execute();

  return reply.status(200).send({ gyms });
}
