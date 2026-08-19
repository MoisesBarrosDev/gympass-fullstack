import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { GymAlreadyDeletedError } from "../../services/errors/gym-already-deleted-error.js";
import { ResourceNotFoundError } from "../../services/errors/resource-not-found-error.js";
import { makeDeleteGymUseCase } from "../../services/factories/make-delete-gym-use-case.js";

export async function deleteGym(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ gymId: z.string().uuid() });
  const { gymId } = paramsSchema.parse(req.params);

  try {
    await makeDeleteGymUseCase().execute({ id: gymId });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof GymAlreadyDeletedError) {
      return reply.status(409).send({ message: error.message });
    }
    throw error;
  }
}
