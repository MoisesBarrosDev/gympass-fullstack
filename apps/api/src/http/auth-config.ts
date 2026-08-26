export const ACCESS_TOKEN_EXPIRES_IN = "15m";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000);
}
