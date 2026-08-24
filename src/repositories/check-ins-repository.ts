import type { CheckIn } from "../generated/prisma/client.js";

export interface CreateCheckInData {
  user_id: string;
  gym_id: string;
}

export interface CheckInWithDetails extends CheckIn {
  user: {
    name: string;
    email: string;
  };
  gym: {
    title: string;
  };
}

export interface CheckInsRepository {
  createCheckIn(data: CreateCheckInData): Promise<CheckIn>;
  findCheckInByUserIdOnDate(userId: string, date: Date): Promise<CheckIn | null>;
  findManyCheckInsByUserId(userId: string, page: number): Promise<CheckIn[]>;
  findManyPendingCheckIns(
    page: number,
    createdAfter: Date,
  ): Promise<CheckInWithDetails[]>;
  findManyExpiredCheckIns(
    page: number,
    createdBefore: Date,
  ): Promise<CheckInWithDetails[]>;
  findManyValidatedCheckIns(page: number): Promise<CheckInWithDetails[]>;
  findCheckInById(id: string): Promise<CheckIn | null>;
  deleteCheckInById(id: string): Promise<CheckIn | null>;
  saveCheckIn(checkIn: CheckIn): Promise<CheckIn>;
  countValidatedCheckInsByUserId(userId: string): Promise<number>;
  countAllValidatedCheckIns(): Promise<number>;
}
