import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeFetchDeletedGymsUseCase } from "../../services/factories/make-fetch-deleted-gyms-use-case.js";

export async function fetchDeletedGyms(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
  });
  const { page } = querySchema.parse(req.query);
  const { gyms } = await makeFetchDeletedGymsUseCase().execute({ page });

  return reply.status(200).send({ gyms });
}
