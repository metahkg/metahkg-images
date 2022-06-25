import dotenv from "dotenv";
import router from "./router/router";
import { client } from "./common";
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

dotenv.config();

const fastify = Fastify({
  logger: true,
  trustProxy: true,
});

fastify.register(cors);
fastify.register(rateLimit, { max: 100, timeWindow: "1 minute" });

fastify.register(router);

client.connect().then(() => {
  const port = Number(process.env.port) || 3000;
  fastify.listen({ port, host: "0.0.0.0" }, () => {
    console.log(`listening at port ${port}`);
  });
});
