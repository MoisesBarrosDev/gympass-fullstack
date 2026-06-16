import { app } from "./app.js";
import { env } from "./env/index.js";
try {
   await app.listen({
    host: "0.0.0.0",
    port: env.PORT,
  });
  console.log('HTTP Server Running!')
} catch (error) {
    console.error(`O servidor não está funcionando error : ${error}`)
}
