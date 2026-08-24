import type { FastifyInstance } from "fastify";
import { createGym } from "../controllers/create-gym.js";
import { deleteGym } from "../controllers/delete-gym.js";
import { fetchDeletedGyms } from "../controllers/fetch-deleted-gyms.js";
import { fetchGyms } from "../controllers/fetch-gyms.js";
import { fetchNearbyGyms } from "../controllers/fetch-nearby-gyms.js";
import { permanentlyDeleteAllGyms } from "../controllers/permanently-delete-all-gyms.js";
import { permanentlyDeleteGym } from "../controllers/permanently-delete-gym.js";
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
  app.get(
    "/gyms/deleted",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    fetchDeletedGyms,
  );
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
  app.delete(
    "/gyms/deleted/permanent",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    permanentlyDeleteAllGyms,
  );
  app.delete(
    "/gyms/:gymId/permanent",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    permanentlyDeleteGym,
  );
  app.patch(
    "/gyms/:gymId/restore",
    { onRequest: [verifyJWT, verifyUserRole("ADMIN")] },
    restoreGym,
  );
}
