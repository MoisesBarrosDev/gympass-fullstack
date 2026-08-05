import type { Gym } from "../generated/prisma/client.js";
import type { GymCreateInput } from "../generated/prisma/models.js";

export interface UpdateGymData {
  id: string;
  title?: string | undefined;
  description?: string | null | undefined;
  phone?: string | null | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
}

export interface FindManyNearbyProps {
  latitude: number;
  longitude: number;
}

export interface GymsRepository {
  findById(id: string): Promise<Gym | null>;
  findDeletedById(id: string): Promise<Gym | null>;
  create(data: GymCreateInput): Promise<Gym>;
  deleteById(id: string): Promise<Gym | null>;
  restoreById(id: string): Promise<Gym | null>;
  findMany(): Promise<Gym[]>;
  searchManyGyms(query: string, page: number): Promise<Gym[]>;
  update(data: UpdateGymData): Promise<Gym | null>;
  findManyNearby(params: FindManyNearbyProps): Promise<Gym[]>;
}
