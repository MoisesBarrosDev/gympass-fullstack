import { app } from "./app.js";
import { env } from "./env/index.js";

await app.listen({
  host: "0.0.0.0",
  port: env.PORT,
});
