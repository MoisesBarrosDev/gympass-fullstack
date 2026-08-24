import { PrismaCheckInsRepository } from "../../repositories/prisma/prisma-check-ins-repository.js";
import { GetAllValidatedCheckInsCountUseCase } from "../get-all-validated-check-ins-count.js";

export function makeGetAllValidatedCheckInsCountUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository();

  return new GetAllValidatedCheckInsCountUseCase(checkInsRepository);
}
