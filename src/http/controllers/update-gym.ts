import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ResourceNotFoundError } from "../../services/errors/resource-not-found-error.js";
import { makeUpdateGymUseCase } from "../../services/factories/make-update-gym-use-case.js";

export async function updateGym(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ gymId: z.string().uuid() });
  const bodySchema = z.object({
    title: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().nullable().optional(),
    phone: z.string().trim().nullable().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  });
  const { gymId } = paramsSchema.parse(req.params);
  const data = bodySchema.parse(req.body);

  try {
    const { gym } = await makeUpdateGymUseCase().execute({ id: gymId, ...data });
    return reply.status(200).send({ gym });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
