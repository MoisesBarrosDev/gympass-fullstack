import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeCreateGymUseCase } from "../../services/factories/make-create-gym-use-case.js";

export async function createGym(req: FastifyRequest, reply: FastifyReply) {
  const createGymBodySchema = z.object({
    title: z.string().trim().min(2).max(100),
    description: z.string().trim().nullable().optional(),
    phone: z.string().trim().nullable().optional(),
    latitude: z.number().max(90).min(-90),
    longitude: z.number().max(180).min(-180),
  });

  const { title, description, phone, latitude, longitude } =
    createGymBodySchema.parse(req.body);

  const createGymUseCase = makeCreateGymUseCase();

  const { gym } = await createGymUseCase.execute({
    title,
    description: description ?? null,
    phone: phone ?? null,
    latitude,
    longitude,
  });

  return reply.status(201).send({ gym });
}
