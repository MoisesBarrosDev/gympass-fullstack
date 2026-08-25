import type { RefreshToken } from "../generated/prisma/client.js";

export interface CreateRefreshTokenData {
  id: string;
  user_id: string;
  expires_at: Date;
}

export interface RotateRefreshTokenData {
  currentTokenId: string;
  newToken: CreateRefreshTokenData;
}

export interface RefreshTokensRepository {
  create(data: CreateRefreshTokenData): Promise<RefreshToken>;
  findById(id: string): Promise<RefreshToken | null>;
  rotate(data: RotateRefreshTokenData): Promise<RefreshToken | null>;
  revokeById(id: string): Promise<boolean>;
}
