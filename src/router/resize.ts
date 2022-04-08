import { Router } from "express";
import sharp from "sharp";
import axios from "axios";
import { Type } from "@sinclair/typebox";
import { ajv } from "../lib/ajv";
import isUrlHttp from "is-url-http";
const router = Router();
router.get("/resize", async (req, res) => {
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
  if (!ajv.validate(schema, { src, width, height, fit }) || !isUrlHttp(src)) {
    res.status(400);
    res.send({ error: "Bad Request." });
    return;
  }
  axios
    .get(src, { responseType: "arraybuffer" })
    .then(async (imgres) => {
      try {
        const fetchedImg = Buffer.from(imgres.data, "utf-8");
        const resizedImg = await sharp(fetchedImg)
          .resize({ width: width, height: height, fit: fit })
          .toBuffer();
        res.setHeader("Content-Type", "image/png");
        res.send(resizedImg);
      } catch (err) {
        res.status(500);
        res.send({ error: "Error resizing image." });
      }
    })
    .catch(() => {
      res.status(500);
      res.send({ error: "Error fetching image." });
    });
});
export default router;
