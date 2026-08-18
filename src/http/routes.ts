import type { FastifyInstance } from "fastify";
import { register } from "./controllers/register.js";
import { authenticate } from "./controllers/authenticate.js";
import { profile } from "./controllers/profile.js";
import { verifyJWT } from "./middlewares/verify-jwt.js";
import { createGym } from "./controllers/create-gym.js";
import { fetchGyms } from "./controllers/fetch-gyms.js";

export async function appRoutes(app: FastifyInstance) {
  app.post("/users", register);
  app.post("/sessions", authenticate);

  // Authenticate
  app.get("/me", { onRequest: [verifyJWT] }, profile);
  app.post("/gyms", { onRequest: [verifyJWT] }, createGym);
  app.get("/gyms", { onRequest: [verifyJWT] }, fetchGyms);
}
