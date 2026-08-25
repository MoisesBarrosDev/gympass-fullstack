import type { FastifySchema } from "fastify";

const idParams = (name: "gymId" | "checkInId") => ({
  type: "object",
  required: [name],
  properties: {
    [name]: {
      type: "string",
      format: "uuid",
      description: name === "gymId" ? "ID da academia" : "ID do check-in",
    },
  },
});

const pageQuery = {
  type: "object",
  properties: {
    page: {
      type: "integer",
      minimum: 1,
      default: 1,
      description: "Número da página",
    },
  },
};

const messageResponse = {
  type: "object",
  required: ["message"],
  properties: {
    message: { type: "string" },
  },
};

const tokenResponse = {
  type: "object",
  required: ["token"],
  properties: {
    token: {
      type: "string",
      description: "Access token JWT",
    },
  },
};

const userResponse = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: ["MEMBER", "ADMIN"] },
    created_at: { type: "string", format: "date-time" },
  },
};

const gymResponse = {
  type: "object",
  additionalProperties: true,
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string" },
    description: { type: "string", nullable: true },
    phone: { type: "string", nullable: true },
    latitude: { type: "number" },
    longitude: { type: "number" },
    deleted_at: { type: "string", format: "date-time", nullable: true },
  },
};

const checkInResponse = {
  type: "object",
  additionalProperties: true,
  properties: {
    id: { type: "string", format: "uuid" },
    user_id: { type: "string", format: "uuid" },
    gym_id: { type: "string", format: "uuid" },
    created_at: { type: "string", format: "date-time" },
    validated_at: { type: "string", format: "date-time", nullable: true },
  },
};

const authErrors = {
  401: { description: "Token ausente ou inválido", ...messageResponse },
};

const adminErrors = {
  ...authErrors,
  403: {
    description: "Acesso permitido apenas para administradores",
    ...messageResponse,
  },
};

const routeDocumentation: Record<string, FastifySchema> = {
  "POST /users": {
    tags: ["Usuários"],
    summary: "Cadastrar usuário",
    description: "Cria uma nova conta de membro.",
    body: {
      type: "object",
      required: ["name", "email", "password"],
      properties: {
        name: { type: "string", example: "Ana Silva" },
        email: { type: "string", format: "email", example: "ana@email.com" },
        password: { type: "string", minLength: 6, example: "123456" },
      },
    },
    response: {
      201: { description: "Usuário criado com sucesso" },
      400: { description: "Dados inválidos", ...messageResponse },
      409: { description: "E-mail já cadastrado", ...messageResponse },
    },
  },
  "POST /sessions": {
    tags: ["Autenticação"],
    summary: "Autenticar usuário",
    description:
      "Retorna um access token e define o refresh token em um cookie HTTP-only.",
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email", example: "ana@email.com" },
        password: { type: "string", minLength: 6, example: "123456" },
      },
    },
    response: {
      200: { description: "Autenticação realizada", ...tokenResponse },
      400: { description: "Credenciais inválidas", ...messageResponse },
    },
  },
  "POST /sessions/refresh": {
    tags: ["Autenticação"],
    summary: "Renovar sessão",
    description: "Renova os tokens utilizando o cookie `refreshToken`.",
    security: [{ refreshToken: [] }],
    response: {
      200: { description: "Sessão renovada", ...tokenResponse },
      401: { description: "Refresh token inválido", ...messageResponse },
    },
  },
  "POST /sessions/logout": {
    tags: ["Autenticação"],
    summary: "Encerrar sessão",
    description: "Revoga o refresh token e remove seu cookie.",
    security: [{ refreshToken: [] }],
    response: {
      204: { description: "Sessão encerrada" },
    },
  },
  "GET /me": {
    tags: ["Usuários"],
    summary: "Obter perfil",
    security: [{ bearerAuth: [] }],
    response: {
      200: { description: "Perfil do usuário autenticado", ...userResponse },
      ...authErrors,
      404: { description: "Usuário não encontrado", ...messageResponse },
    },
  },
  "POST /gyms": {
    tags: ["Academias"],
    summary: "Cadastrar academia",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: ["title", "latitude", "longitude"],
      properties: {
        title: { type: "string", example: "Gym Center" },
        description: {
          type: "string",
          nullable: true,
          example: "Academia completa",
        },
        phone: {
          type: "string",
          nullable: true,
          example: "+55 21 99999-9999",
        },
        latitude: {
          type: "number",
          minimum: -90,
          maximum: 90,
          example: -22.9068,
        },
        longitude: {
          type: "number",
          minimum: -180,
          maximum: 180,
          example: -43.1729,
        },
      },
    },
    response: {
      201: {
        description: "Academia criada",
        type: "object",
        properties: { gym: gymResponse },
      },
      ...adminErrors,
    },
  },
  "GET /gyms": {
    tags: ["Academias"],
    summary: "Listar academias",
    security: [{ bearerAuth: [] }],
    querystring: pageQuery,
    response: {
      200: {
        description: "Lista paginada de academias",
        type: "object",
        properties: {
          gyms: { type: "array", items: gymResponse },
          total: { type: "integer" },
        },
      },
      ...authErrors,
    },
  },
  "GET /gyms/search": {
    tags: ["Academias"],
    summary: "Buscar academias por nome",
    security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", minLength: 1, example: "Gym" },
        ...pageQuery.properties,
      },
    },
    response: {
      200: {
        description: "Academias encontradas",
        type: "object",
        properties: { gyms: { type: "array", items: gymResponse } },
      },
      ...authErrors,
    },
  },
  "GET /gyms/nearby": {
    tags: ["Academias"],
    summary: "Buscar academias próximas",
    security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      required: ["userLatitude", "userLongitude"],
      properties: {
        userLatitude: {
          type: "number",
          minimum: -90,
          maximum: 90,
          example: -22.9068,
        },
        userLongitude: {
          type: "number",
          minimum: -180,
          maximum: 180,
          example: -43.1729,
        },
        ...pageQuery.properties,
      },
    },
    response: {
      200: {
        description: "Academias próximas",
        type: "object",
        properties: { gyms: { type: "array", items: gymResponse } },
      },
      ...authErrors,
    },
  },
  "GET /gyms/deleted": {
    tags: ["Academias"],
    summary: "Listar academias removidas",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    querystring: pageQuery,
    response: {
      200: {
        description: "Academias removidas",
        type: "object",
        properties: {
          gyms: { type: "array", items: gymResponse },
          total: { type: "integer" },
        },
      },
      ...adminErrors,
    },
  },
  "PATCH /gyms/:gymId": {
    tags: ["Academias"],
    summary: "Atualizar academia",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    params: idParams("gymId"),
    body: {
      type: "object",
      minProperties: 1,
      properties: {
        title: { type: "string" },
        description: { type: "string", nullable: true },
        phone: { type: "string", nullable: true },
        latitude: { type: "number", minimum: -90, maximum: 90 },
        longitude: { type: "number", minimum: -180, maximum: 180 },
      },
    },
    response: {
      200: {
        description: "Academia atualizada",
        type: "object",
        properties: { gym: gymResponse },
      },
      ...adminErrors,
      404: { description: "Academia não encontrada", ...messageResponse },
    },
  },
  "DELETE /gyms/:gymId": {
    tags: ["Academias"],
    summary: "Remover academia",
    description:
      "Realiza uma remoção lógica. Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    params: idParams("gymId"),
    response: {
      204: { description: "Academia removida" },
      ...adminErrors,
      404: { description: "Academia não encontrada", ...messageResponse },
      409: { description: "Academia já removida", ...messageResponse },
    },
  },
  "DELETE /gyms/deleted/permanent": {
    tags: ["Academias"],
    summary: "Excluir permanentemente todas as academias removidas",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        description: "Quantidade de academias excluídas",
        type: "object",
        properties: { count: { type: "integer" } },
      },
      ...adminErrors,
    },
  },
  "DELETE /gyms/:gymId/permanent": {
    tags: ["Academias"],
    summary: "Excluir academia permanentemente",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    params: idParams("gymId"),
    response: {
      204: { description: "Academia excluída permanentemente" },
      ...adminErrors,
      404: { description: "Academia não encontrada", ...messageResponse },
    },
  },
  "PATCH /gyms/:gymId/restore": {
    tags: ["Academias"],
    summary: "Restaurar academia removida",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    params: idParams("gymId"),
    response: {
      200: {
        description: "Academia restaurada",
        type: "object",
        properties: { gym: gymResponse },
      },
      ...adminErrors,
      404: { description: "Academia não encontrada", ...messageResponse },
      409: { description: "Academia já está ativa", ...messageResponse },
    },
  },
  "POST /gyms/:gymId/check-ins": {
    tags: ["Check-ins"],
    summary: "Realizar check-in",
    security: [{ bearerAuth: [] }],
    params: idParams("gymId"),
    body: {
      type: "object",
      required: ["userLatitude", "userLongitude"],
      properties: {
        userLatitude: {
          type: "number",
          minimum: -90,
          maximum: 90,
          example: -22.9068,
        },
        userLongitude: {
          type: "number",
          minimum: -180,
          maximum: 180,
          example: -43.1729,
        },
      },
    },
    response: {
      201: {
        description: "Check-in realizado",
        type: "object",
        properties: { checkIn: checkInResponse },
      },
      ...authErrors,
      400: {
        description: "Usuário fora da distância permitida",
        ...messageResponse,
      },
      404: { description: "Academia não encontrada", ...messageResponse },
      409: {
        description: "Limite diário de check-ins atingido",
        ...messageResponse,
      },
    },
  },
  "GET /check-ins/history": {
    tags: ["Check-ins"],
    summary: "Listar histórico do usuário",
    security: [{ bearerAuth: [] }],
    querystring: pageQuery,
    response: {
      200: {
        description: "Histórico de check-ins",
        type: "object",
        properties: {
          checkIns: { type: "array", items: checkInResponse },
          total: { type: "integer" },
        },
      },
      ...authErrors,
    },
  },
  "GET /check-ins/metrics": {
    tags: ["Check-ins"],
    summary: "Obter total de check-ins do usuário",
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        description: "Total de check-ins",
        type: "object",
        properties: { checkInsCount: { type: "integer" } },
      },
      ...authErrors,
    },
  },
  "GET /check-ins/pending": {
    tags: ["Check-ins"],
    summary: "Listar check-ins pendentes",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    querystring: pageQuery,
    response: {
      200: {
        description: "Check-ins pendentes",
        type: "object",
        properties: {
          checkIns: { type: "array", items: checkInResponse },
          total: { type: "integer" },
        },
      },
      ...adminErrors,
    },
  },
  "GET /check-ins/expired": {
    tags: ["Check-ins"],
    summary: "Listar check-ins expirados",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    querystring: pageQuery,
    response: {
      200: {
        description: "Check-ins expirados",
        type: "object",
        properties: {
          checkIns: { type: "array", items: checkInResponse },
          total: { type: "integer" },
        },
      },
      ...adminErrors,
    },
  },
  "GET /check-ins/validated": {
    tags: ["Check-ins"],
    summary: "Listar check-ins validados",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    querystring: pageQuery,
    response: {
      200: {
        description: "Check-ins validados",
        type: "object",
        properties: {
          checkIns: { type: "array", items: checkInResponse },
          total: { type: "integer" },
        },
      },
      ...adminErrors,
    },
  },
  "GET /check-ins/metrics/global": {
    tags: ["Check-ins"],
    summary: "Obter total global de check-ins validados",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        description: "Total global de check-ins validados",
        type: "object",
        properties: { checkInsCount: { type: "integer" } },
      },
      ...adminErrors,
    },
  },
  "DELETE /check-ins/expired/:checkInId": {
    tags: ["Check-ins"],
    summary: "Excluir check-in expirado",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    params: idParams("checkInId"),
    response: {
      204: { description: "Check-in excluído" },
      ...adminErrors,
      404: { description: "Check-in não encontrado", ...messageResponse },
      409: { description: "Check-in ainda não expirou", ...messageResponse },
    },
  },
  "PATCH /check-ins/:checkInId/validate": {
    tags: ["Check-ins"],
    summary: "Validar check-in",
    description: "Operação exclusiva de administradores.",
    security: [{ bearerAuth: [] }],
    params: idParams("checkInId"),
    response: {
      204: { description: "Check-in validado" },
      ...adminErrors,
      400: { description: "Prazo de validação expirado", ...messageResponse },
      404: { description: "Check-in não encontrado", ...messageResponse },
    },
  },
};

export function getRouteDocumentation(method: string | string[], url: string) {
  const routeMethod = Array.isArray(method) ? method[0] : method;

  if (!routeMethod) {
    return undefined;
  }

  return routeDocumentation[`${routeMethod.toUpperCase()} ${url}`];
}
