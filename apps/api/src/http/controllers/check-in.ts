import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { MaxDistanceError } from "../../services/errors/max-distance-error.js";
import { MaxNumberOfCheckInsError } from "../../services/errors/max-number-of-check-ins-error.js";
import { ResourceNotFoundError } from "../../services/errors/resource-not-found-error.js";
import { makeCheckInUseCase } from "../../services/factories/make-check-in-use-case.js";

export async function checkIn(req: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ gymId: z.string().uuid() });
  const bodySchema = z.object({
    userLatitude: z.number().min(-90).max(90),
    userLongitude: z.number().min(-180).max(180),
  });
  const { gymId } = paramsSchema.parse(req.params);
  const { userLatitude, userLongitude } = bodySchema.parse(req.body);

  try {
    const { checkIn } = await makeCheckInUseCase().execute({
      gymId,
      userId: req.user.sub,
      userLatitude,
      userLongitude,
    });
    return reply.status(201).send({ checkIn });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof MaxDistanceError) {
      return reply.status(400).send({ message: error.message });
    }
    if (error instanceof MaxNumberOfCheckInsError) {
      return reply.status(409).send({ message: error.message });
    }
    throw error;
  }
}
