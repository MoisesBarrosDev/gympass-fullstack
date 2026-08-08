import type { CheckIn } from "../generated/prisma/client.js";

export interface CreateCheckInData {
  user_id: string;
  gym_id: string;
}

export interface CheckInsRepository {
  createCheckIn(data: CreateCheckInData): Promise<CheckIn>;
  findCheckInByUserIdOnDate(userId: string, date: Date): Promise<CheckIn | null>;
  findManyCheckInsByUserId(userId: string, page: number): Promise<CheckIn[]>;
  findCheckInById(id: string): Promise<CheckIn | null>;
  saveCheckIn(checkIn: CheckIn): Promise<CheckIn>;
  countCheckInsByUserId(userId: string): Promise<number>;
}
