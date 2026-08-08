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
  findGymById(id: string): Promise<Gym | null>;
  findDeletedGymById(id: string): Promise<Gym | null>;
  createGym(data: GymCreateInput): Promise<Gym>;
  deleteGymById(id: string): Promise<Gym | null>;
  restoreGymById(id: string): Promise<Gym | null>;
  findManyGyms(): Promise<Gym[]>;
  searchManyGyms(query: string, page: number): Promise<Gym[]>;
  updateGym(data: UpdateGymData): Promise<Gym | null>;
  findManyNearbyGyms(params: FindManyNearbyProps): Promise<Gym[]>;
}
