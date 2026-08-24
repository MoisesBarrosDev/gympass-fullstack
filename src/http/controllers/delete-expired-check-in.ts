import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CheckInNotExpiredError } from "../../services/errors/check-in-not-expired-error.js";
import { ResourceNotFoundError } from "../../services/errors/resource-not-found-error.js";
import { makeDeleteExpiredCheckInUseCase } from "../../services/factories/make-delete-expired-check-in-use-case.js";

export async function deleteExpiredCheckIn(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ checkInId: z.string().uuid() });
  const { checkInId } = paramsSchema.parse(req.params);

  try {
    await makeDeleteExpiredCheckInUseCase().execute({ checkInId });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof CheckInNotExpiredError) {
      return reply.status(409).send({ message: error.message });
    }
    throw error;
  }
}
