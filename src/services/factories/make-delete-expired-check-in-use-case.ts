import { PrismaCheckInsRepository } from "../../repositories/prisma/prisma-check-ins-repository.js";
import { DeleteExpiredCheckInUseCase } from "../delete-expired-check-in.js";

export function makeDeleteExpiredCheckInUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository();

  return new DeleteExpiredCheckInUseCase(checkInsRepository);
}
