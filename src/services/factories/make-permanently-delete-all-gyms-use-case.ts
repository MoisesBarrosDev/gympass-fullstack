import { PrismaGymsRepository } from "../../repositories/prisma/prisma-gyms-repository.js";
import { PermanentlyDeleteAllGymsUseCase } from "../permanently-delete-all-gyms.js";

export function makePermanentlyDeleteAllGymsUseCase() {
  return new PermanentlyDeleteAllGymsUseCase(new PrismaGymsRepository());
}
