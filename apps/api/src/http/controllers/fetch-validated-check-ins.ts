import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeFetchValidatedCheckInsUseCase } from "../../services/factories/make-fetch-validated-check-ins-use-case.js";

export async function fetchValidatedCheckIns(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
  });
  const { page } = querySchema.parse(req.query);
  const { checkIns, total } = await makeFetchValidatedCheckInsUseCase().execute({
    page,
  });

  return reply.status(200).send({ checkIns, total });
}
