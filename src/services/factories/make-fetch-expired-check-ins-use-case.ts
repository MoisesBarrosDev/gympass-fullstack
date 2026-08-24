import { PrismaCheckInsRepository } from "../../repositories/prisma/prisma-check-ins-repository.js";
import { FetchExpiredCheckInsUseCase } from "../fetch-expired-check-ins.js";

export function makeFetchExpiredCheckInsUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository();

  return new FetchExpiredCheckInsUseCase(checkInsRepository);
}
