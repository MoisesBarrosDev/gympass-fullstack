import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeFetchNearbyGymsUseCase } from "../../services/factories/make-fetch-nearby-gyms-use-case.js";

export async function fetchNearbyGyms(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const fetchNearbyGymsQuerySchema = z.object({
    userLatitude: z.coerce.number().min(-90).max(90),
    userLongitude: z.coerce.number().min(-180).max(180),
    page: z.coerce.number().int().positive().default(1),
  });

  const { userLatitude, userLongitude, page } =
    fetchNearbyGymsQuerySchema.parse(req.query);

  const { gyms } = await makeFetchNearbyGymsUseCase().execute({
    userLatitude,
    userLongitude,
    page,
  });

  return reply.status(200).send({ gyms });
}
