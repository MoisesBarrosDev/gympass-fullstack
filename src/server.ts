import { app } from "./app.js";

try {
   await app.listen({
    host: "0.0.0.0",
    port: 3333,
  });
  console.log('HTTP Server Running!')
} catch (error) {
    console.error(`O servidor não está funcionando error : ${error}`)
}
