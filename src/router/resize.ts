import sharp from "sharp";
import axios from "axios";
import { Type } from "@sinclair/typebox";
import { ajv } from "../lib/ajv";
import isUrlHttp from "is-url-http";
import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) {
  fastify.get(
    "/resize",
    async (
      req: FastifyRequest<{
        Querystring: { src: string; width: string; height: string };
      }>,
      res
    ) => {
      const src = decodeURIComponent(String(req.query.src));
      const width = Number(req.query.width) || undefined;
      const height = Number(req.query.height) || undefined;
      // @ts-ignore
      const fit: "cover" | "contain" = String(req.query.fit || "contain");

      const schema = Type.Object({
        src: Type.String({ format: "uri" }),
        width: Type.Optional(Type.Number({ maximum: 1000, minimum: 10 })),
        height: Type.Optional(Type.Number({ maximum: 1000, minimum: 10 })),
        fit: Type.Union([Type.Literal("contain"), Type.Literal("cover")]),
      });

      if (!ajv.validate(schema, { src, width, height, fit }) || !isUrlHttp(src))
        return res.status(400).send({ error: "Bad Request." });

      axios
        .get(src, { responseType: "arraybuffer" })
        .then(async (imgres) => {
          try {
            const fetchedImg = Buffer.from(imgres.data, "utf-8");

            const resizedImg = await sharp(fetchedImg)
              .resize({
                width: width,
                height: height,
                fit: fit,
              })
              .toFormat("png")
              .toBuffer();

            return res.header("Content-Type", "image/png").send(resizedImg);
          } catch (err) {
            console.error(err);
            return res.status(500).send({ error: "Error resizing image." });
          }
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).send({ error: "Error fetching image." });
        });
    }
  );
  done();
}
