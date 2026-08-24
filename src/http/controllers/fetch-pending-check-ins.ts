import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeFetchPendingCheckInsUseCase } from "../../services/factories/make-fetch-pending-check-ins-use-case.js";

export async function fetchPendingCheckIns(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
  });
  const { page } = querySchema.parse(req.query);
  const { checkIns } = await makeFetchPendingCheckInsUseCase().execute({ page });

  return reply.status(200).send({ checkIns });
}
