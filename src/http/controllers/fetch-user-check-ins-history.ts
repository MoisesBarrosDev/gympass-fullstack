import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeFetchUserCheckInsHistoryUseCase } from "../../services/factories/make-fetch-user-check-ins-history-use-case.js";

export async function fetchUserCheckInsHistory(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
  });
  const { page } = querySchema.parse(req.query);
  const { checkIns } = await makeFetchUserCheckInsHistoryUseCase().execute({
    userId: req.user.sub,
    page,
  });
  return reply.status(200).send({ checkIns });
}
