import { PrismaGymsRepository } from "../../repositories/prisma/prisma-gyms-repository.js";
import { FetchGymsUseCase } from "../fetch-gyms.js";

export function makeFetchGymsUseCase() {
  const gymsRepository = new PrismaGymsRepository();

  return new FetchGymsUseCase(gymsRepository);
}
