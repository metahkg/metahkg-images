import { Router } from "express";
import sharp from "sharp";
import axios from "axios";
import { Type } from "@sinclair/typebox";
import { ajv } from "../lib/ajv";
import isUrlHttp from "is-url-http";
const router = Router();
router.get("/resize", async (req, res) => {
  const src = String(req.query.src);
  const width = Number(req.query.width) || undefined;
  const height = Number(req.query.height) || undefined;
  const schema = Type.Object({
    src: Type.String({ format: "uri" }),
    width: Type.Optional(Type.Number()),
    height: Type.Optional(Type.Number()),
  });
  if (!ajv.validate(schema, { src, width, height }) || !isUrlHttp(src)) {
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
          .resize({ width: width, height: height, fit: "contain" })
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