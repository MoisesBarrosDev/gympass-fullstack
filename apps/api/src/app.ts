import fastify from "fastify";
import type { IncomingMessage, ServerResponse } from "node:http";
import { ZodError } from "zod";
import { env } from "./env/index.js";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { usersRoutes } from "./http/routes/users-routes.js";
import { gymsRoutes } from "./http/routes/gyms-routes.js";
import { checkInsRoutes } from "./http/routes/check-ins-routes.js";
import { getRouteDocumentation } from "./http/docs/openapi.js";

export const app = fastify();

app.register(fastifySwagger, {
  openapi: {
    openapi: "3.0.3",
    info: {
      title: "GymPass API",
      description:
        "API REST para gerenciamento de academias, usuários e check-ins.",
      version: "1.0.0",
    },
    servers: [
      {
        url: "/",
        description: "Servidor atual",
      },
    ],
    tags: [
      { name: "Autenticação", description: "Login, renovação e logout" },
      { name: "Usuários", description: "Cadastro e perfil de usuários" },
      {
        name: "Academias",
        description: "Consulta e gerenciamento de academias",
      },
      {
        name: "Check-ins",
        description: "Realização e gerenciamento de check-ins",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        refreshToken: {
          type: "apiKey",
          in: "cookie",
          name: "refreshToken",
        },
      },
    },
  },
  transform: ({ schema, url, route }) => ({
    schema: {
      ...schema,
      ...getRouteDocumentation(route?.method ?? "", url),
    },
    url,
  }),
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
    persistAuthorization: true,
  },
  staticCSP: true,
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: "1d" },
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
});

app.register(fastifyCookie);

app.get("/", async () => ({
  name: "GymPass API",
  status: "online",
  documentation: "/docs",
}));

app.get("/health", async () => ({ status: "ok" }));

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
  }
  return reply.status(500).send({ message: "Internal server error." });
});

const appReady = app.ready();

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) {
  await appReady;
  app.server.emit("request", request, response);
}
