import { PrismaGymsRepository } from "../../repositories/prisma/prisma-gyms-repository.js";
import { FetchDeletedGymsUseCase } from "../fetch-deleted-gyms.js";

export function makeFetchDeletedGymsUseCase() {
  const gymsRepository = new PrismaGymsRepository();

  return new FetchDeletedGymsUseCase(gymsRepository);
}
