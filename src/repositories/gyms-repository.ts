import type { Gym } from "../generated/prisma/client.js";
import type { GymCreateInput } from "../generated/prisma/models.js";

export interface GymsRepository {
  findById(id: string): Promise<Gym | null>;
  findDeletedById(id: string): Promise<Gym | null>;
  create(data: GymCreateInput): Promise<Gym>;
  deleteById(id: string): Promise<Gym | null>;
  restoreById(id: string): Promise<Gym | null>;
}
