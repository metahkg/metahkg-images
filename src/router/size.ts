import sizeOf from "buffer-image-size";
import isUrlHttp from "is-url-http";
import axios from "axios";
import { imagesCl } from "../common";
import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";

export default function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) {
  fastify.get(
    "/size",
    async (req: FastifyRequest<{ Querystring: { src: string } }>, res) => {
      const src = decodeURIComponent(String(req.query.src));

      if (!req.query.src || !isUrlHttp(src))
        return res.status(400).send({ error: "Bad Request." });

      const image = await imagesCl.findOne({ original: src });

      if (image?.width && image?.height)
        return res.send({ width: image.width, height: image.height });

      try {
        const { data } = await axios.get(src, {
          responseType: "arraybuffer",
          maxContentLength: 1024 * 1024 * 2,
          headers: { "Content-Type": "image/*", accept: "image/*" },
        });

        const fetchedimg = Buffer.from(data, "utf-8");
        const dimensions = sizeOf(fetchedimg);

        res.send({ height: dimensions.height, width: dimensions.width });
        
        const insertContent = {
          original: src,
          width: dimensions.width,
          height: dimensions.height,
        };
        if (!image) imagesCl.insertOne(insertContent);
        else imagesCl.updateOne({ original: src }, { $set: insertContent });
      } catch (err) {
        console.error(err);
        return res.status(500).send({ error: "Error getting size." });
      }
    }
  );
  done();
}
