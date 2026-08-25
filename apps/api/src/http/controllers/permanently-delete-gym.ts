import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ResourceNotFoundError } from "../../services/errors/resource-not-found-error.js";
import { makePermanentlyDeleteGymUseCase } from "../../services/factories/make-permanently-delete-gym-use-case.js";

export async function permanentlyDeleteGym(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ gymId: z.string().uuid() });
  const { gymId } = paramsSchema.parse(req.params);

  try {
    await makePermanentlyDeleteGymUseCase().execute({ id: gymId });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
