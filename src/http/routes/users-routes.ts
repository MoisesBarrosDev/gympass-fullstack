import type { FastifyInstance } from "fastify";
import { authenticate } from "../controllers/authenticate.js";
import { profile } from "../controllers/profile.js";
import { register } from "../controllers/register.js";
import { verifyJWT } from "../middlewares/verify-jwt.js";
import { refresh } from "../controllers/refresh.js";
import { logout } from "../controllers/logout.js";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/users", register);
  app.post("/sessions", authenticate);
  app.post("/sessions/refresh", refresh);
  app.post("/sessions/logout", logout);
  app.get("/me", { onRequest: [verifyJWT] }, profile);
}
