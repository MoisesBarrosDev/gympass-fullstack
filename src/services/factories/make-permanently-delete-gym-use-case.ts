import { PrismaGymsRepository } from "../../repositories/prisma/prisma-gyms-repository.js";
import { PermanentlyDeleteGymUseCase } from "../permanently-delete-gym.js";

export function makePermanentlyDeleteGymUseCase() {
  const gymsRepository = new PrismaGymsRepository();

  return new PermanentlyDeleteGymUseCase(gymsRepository);
}
