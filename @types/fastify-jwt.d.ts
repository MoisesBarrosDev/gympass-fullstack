import '@fastify/jwt'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    payload: {
      type: 'access' | 'refresh';
      jti?: string;
    };
    user: {
      sub: string;
      type: 'access' | 'refresh';
      jti?: string;
    }
  }
}
