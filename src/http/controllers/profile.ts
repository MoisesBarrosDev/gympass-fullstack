import type { FastifyRequest, FastifyReply } from "fastify";
import { makeGetUserProfileUseCase } from "../../services/factories/make-get-user-profile-use-case.js";

export async function profile(req: FastifyRequest, reply: FastifyReply) {
  const getUserProfile = makeGetUserProfileUseCase();

  const { user } = await getUserProfile.execute({
    userId: req.user.sub,
  });

  return reply.status(201).send({
    ...user,
    password_hash: undefined,
  });
}
