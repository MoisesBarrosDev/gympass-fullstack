import { PrismaCheckInsRepository } from "../../repositories/prisma/prisma-check-ins-repository.js";
import { FetchPendingCheckInsUseCase } from "../fetch-pending-check-ins.js";

export function makeFetchPendingCheckInsUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository();

  return new FetchPendingCheckInsUseCase(checkInsRepository);
}
