import fastify from "fastify";
import { appRoutes } from "./http/routes.js";
import { ZodError } from "zod";
import { env } from "./env/index.js";

export const app = fastify();

app.register(appRoutes);

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
