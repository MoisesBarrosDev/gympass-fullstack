import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { LateCheckInValidationError } from "../../services/errors/late-check-in-validation-error.js";
import { ResourceNotFoundError } from "../../services/errors/resource-not-found-error.js";
import { makeValidateCheckInUseCase } from "../../services/factories/make-validate-check-in-use-case.js";

export async function validateCheckIn(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ checkInId: z.string().uuid() });
  const { checkInId } = paramsSchema.parse(req.params);

  try {
    await makeValidateCheckInUseCase().execute({ checkInId });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof LateCheckInValidationError) {
      return reply.status(400).send({ message: error.message });
    }
    throw error;
  }
}
