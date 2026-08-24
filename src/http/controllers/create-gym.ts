import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeCreateGymUseCase } from "../../services/factories/make-create-gym-use-case.js";
import {
  gymDescriptionSchema,
  gymPhoneSchema,
  gymTitleSchema,
  latitudeSchema,
  longitudeSchema,
} from "../schemas/gym-schema.js";

export async function createGym(req: FastifyRequest, reply: FastifyReply) {
  const createGymBodySchema = z.object({
    title: gymTitleSchema,
    description: gymDescriptionSchema,
    phone: gymPhoneSchema,
    latitude: latitudeSchema,
    longitude: longitudeSchema,
  });

  const { title, description, phone, latitude, longitude } =
    createGymBodySchema.parse(req.body);

  const createGymUseCase = makeCreateGymUseCase();

  const { gym } = await createGymUseCase.execute({
    title,
    description,
    phone,
    latitude,
    longitude,
  });

  return reply.status(201).send({ gym });
}
