import { PrismaCheckInsRepository } from "../../repositories/prisma/prisma-check-ins-repository.js";
import { GetUserCheckInsCountUseCase } from "../get-user-check-ins-count.js";

export function makeGetUserCheckInsCountUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository();

  return new GetUserCheckInsCountUseCase(checkInsRepository);
}
