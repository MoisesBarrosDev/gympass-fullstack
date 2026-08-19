import type { FastifyInstance } from "fastify";
import { checkIn } from "../controllers/check-in.js";
import { fetchUserCheckInsHistory } from "../controllers/fetch-user-check-ins-history.js";
import { getUserCheckInsCount } from "../controllers/get-user-check-ins-count.js";
import { validateCheckIn } from "../controllers/validate-check-in.js";
import { verifyJWT } from "../middlewares/verify-jwt.js";

export async function checkInsRoutes(app: FastifyInstance) {
  app.post("/gyms/:gymId/check-ins", { onRequest: [verifyJWT] }, checkIn);
  app.get(
    "/check-ins/history",
    { onRequest: [verifyJWT] },
    fetchUserCheckInsHistory,
  );
  app.get(
    "/check-ins/metrics",
    { onRequest: [verifyJWT] },
    getUserCheckInsCount,
  );
  app.patch(
    "/check-ins/:checkInId/validate",
    { onRequest: [verifyJWT] },
    validateCheckIn,
  );
}
