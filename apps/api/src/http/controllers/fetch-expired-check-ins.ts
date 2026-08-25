import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeFetchExpiredCheckInsUseCase } from "../../services/factories/make-fetch-expired-check-ins-use-case.js";

export async function fetchExpiredCheckIns(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
  });
  const { page } = querySchema.parse(req.query);
  const { checkIns, total } = await makeFetchExpiredCheckInsUseCase().execute({ page });

  return reply.status(200).send({ checkIns, total });
}
