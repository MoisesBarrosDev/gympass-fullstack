import { PrismaCheckInsRepository } from "../../repositories/prisma/prisma-check-ins-repository.js";
import { FetchValidatedCheckInsUseCase } from "../fetch-validated-check-ins.js";

export function makeFetchValidatedCheckInsUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository();
  return new FetchValidatedCheckInsUseCase(checkInsRepository);
}
