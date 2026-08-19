import fastify from "fastify";
import { ZodError } from "zod";
import { env } from "./env/index.js";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import { usersRoutes } from "./http/routes/users-routes.js";
import { gymsRoutes } from "./http/routes/gyms-routes.js";
import { checkInsRoutes } from "./http/routes/check-ins-routes.js";

export const app = fastify();

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: "10m" },
  cookie: {
    cookieName: "refreshToken",
    // O JWT já possui sua própria assinatura; o cookie não recebe uma segunda.
    signed: false,
  },
});

app.register(fastifyCookie);
app.register(usersRoutes);
app.register(gymsRoutes);
app.register(checkInsRoutes);

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: "Validation error.", issues: error.format() });
  }
  if (env.NODE_ENV !== "production") {
    console.error(error);
    // TODO: aqui deveriamos fazer um log para uma ferramenta externa como um DataDog/NewRelic/Sentry, porque
    // em produção não fazemos esse console.error Isso são ferramentas de observabilidade.
  }
  return reply.status(500).send({ message: "Internal server error." });
});
