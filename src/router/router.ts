import thumbnail from "./thumbnail";
import size from "./size";
import resize from "./resize";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) {
  fastify.get("/", (req, res) => {
    console.log("redirect");
    return res.code(301).redirect("https://gitlab.com/metahkg/metahkg-images");
  });
  fastify.register(thumbnail);
  fastify.register(size);
  fastify.register(resize);
  done();
}
