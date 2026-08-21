import "@fastify/jwt";

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    payload: {
      type: "access" | "refresh";
      jti?: string;
      role: "ADMIN" | "MEMBER";
    };
    user: {
      sub: string;
      type: "access" | "refresh";
      jti?: string;
      role: "ADMIN" | "MEMBER";
    };
  }
}
