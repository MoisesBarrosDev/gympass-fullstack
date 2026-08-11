import { PrismaGymsRepository } from "../../repositories/prisma/prisma-gyms-repository.js";
import { UpdateGymUseCase } from "../update-gym.js";

export function makeUpdateGymUseCase() {
  const gymsRepository = new PrismaGymsRepository();

  return new UpdateGymUseCase(gymsRepository);
}
