import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeFetchGymsUseCase } from "../../services/factories/make-fetch-gyms-use-case.js";

export async function fetchGyms(req: FastifyRequest, reply: FastifyReply) {
  const fetchGymsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
  });

  const { page } = fetchGymsQuerySchema.parse(req.query);

  const fetchGymsUseCase = makeFetchGymsUseCase();

  const { gyms, total } = await fetchGymsUseCase.execute({
    page,
  });

  return reply.status(200).send({ gyms, total });
}
