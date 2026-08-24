import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import { makeSearchGymsUseCase } from "../../services/factories/make-search-gyms-use-case.js";

export async function searchGyms(req: FastifyRequest, reply: FastifyReply) {
  const searchGymsQuerySchema = z.object({
    query: z.string().trim().min(1),
    page: z.coerce.number().int().positive().default(1),
  });

  const { query, page } = searchGymsQuerySchema.parse(req.query);

  const searchGymsUseCase = makeSearchGymsUseCase();
  const { gyms } = await searchGymsUseCase.execute({ query, page });

  return reply.status(200).send({ gyms });
}
