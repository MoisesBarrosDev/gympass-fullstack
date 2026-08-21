import type { FastifyInstance } from "fastify";
import { createGym } from "../controllers/create-gym.js";
import { deleteGym } from "../controllers/delete-gym.js";
import { fetchGyms } from "../controllers/fetch-gyms.js";
import { fetchNearbyGyms } from "../controllers/fetch-nearby-gyms.js";
import { restoreGym } from "../controllers/restore-gym.js";
import { searchGyms } from "../controllers/search-gyms.js";
import { updateGym } from "../controllers/update-gym.js";
import { verifyJWT } from "../middlewares/verify-jwt.js";
import { verifyUserRole } from "../middlewares/verify-user-role.js";

export async function gymsRoutes(app: FastifyInstance) {
  app.post(
    "/gyms",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    createGym,
  );
  app.get("/gyms", { onRequest: [verifyJWT] }, fetchGyms);
  app.get("/gyms/search", { onRequest: [verifyJWT] }, searchGyms);
  app.get("/gyms/nearby", { onRequest: [verifyJWT] }, fetchNearbyGyms);
  app.patch(
    "/gyms/:gymId",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    updateGym,
  );
  app.delete(
    "/gyms/:gymId",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    deleteGym,
  );
  app.patch(
    "/gyms/:gymId/restore",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    restoreGym,
  );
}
