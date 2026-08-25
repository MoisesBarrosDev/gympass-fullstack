import { PrismaGymsRepository } from "../../repositories/prisma/prisma-gyms-repository.js";
import { CreateGymUseCase } from "../create-gym.js";

export function makeCreateGymUseCase() {
  const gymsRepository = new PrismaGymsRepository();

  return new CreateGymUseCase(gymsRepository);
}
