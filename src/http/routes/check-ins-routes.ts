import type { FastifyInstance } from "fastify";
import { checkIn } from "../controllers/check-in.js";
import { deleteExpiredCheckIn } from "../controllers/delete-expired-check-in.js";
import { fetchExpiredCheckIns } from "../controllers/fetch-expired-check-ins.js";
import { fetchUserCheckInsHistory } from "../controllers/fetch-user-check-ins-history.js";
import { fetchPendingCheckIns } from "../controllers/fetch-pending-check-ins.js";
import { fetchValidatedCheckIns } from "../controllers/fetch-validated-check-ins.js";
import { getAllValidatedCheckInsCount } from "../controllers/get-all-validated-check-ins-count.js";
import { getUserCheckInsCount } from "../controllers/get-user-check-ins-count.js";
import { validateCheckIn } from "../controllers/validate-check-in.js";
import { verifyJWT } from "../middlewares/verify-jwt.js";
import { verifyUserRole } from "../middlewares/verify-user-role.js";

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
  app.get(
    "/check-ins/pending",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    fetchPendingCheckIns,
  );
  app.get(
    "/check-ins/expired",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    fetchExpiredCheckIns,
  );
  app.get(
    "/check-ins/validated",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    fetchValidatedCheckIns,
  );
  app.get(
    "/check-ins/metrics/global",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    getAllValidatedCheckInsCount,
  );
  app.delete(
    "/check-ins/expired/:checkInId",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    deleteExpiredCheckIn,
  );
  app.patch(
    "/check-ins/:checkInId/validate",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    validateCheckIn,
  );
}
