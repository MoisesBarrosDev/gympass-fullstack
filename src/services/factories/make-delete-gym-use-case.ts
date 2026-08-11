import { PrismaGymsRepository } from "../../repositories/prisma/prisma-gyms-repository.js";
import { DeleteGymUseCase } from "../delete-gym.js";

export function makeDeleteGymUseCase() {
  const gymsRepository = new PrismaGymsRepository();

  return new DeleteGymUseCase(gymsRepository);
}
