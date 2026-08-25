import { PrismaGymsRepository } from "../../repositories/prisma/prisma-gyms-repository.js";
import { RestoreGymUseCase } from "../restore-gym.js";

export function makeRestoreGymUseCase() {
  const gymsRepository = new PrismaGymsRepository();

  return new RestoreGymUseCase(gymsRepository);
}
