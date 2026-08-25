import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { GymAlreadyRestoredError } from "../../services/errors/gym-already-restored-error.js";
import { ResourceNotFoundError } from "../../services/errors/resource-not-found-error.js";
import { makeRestoreGymUseCase } from "../../services/factories/make-restore-gym-use-case.js";

export async function restoreGym(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ gymId: z.string().uuid() });
  const { gymId } = paramsSchema.parse(req.params);

  try {
    const { gym } = await makeRestoreGymUseCase().execute({ id: gymId });
    return reply.status(200).send({ gym });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof GymAlreadyRestoredError) {
      return reply.status(409).send({ message: error.message });
    }
    throw error;
  }
}
