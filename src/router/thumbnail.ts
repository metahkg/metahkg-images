import imageThumbnail from "image-thumbnail";
import isUrlHttp from "is-url-http";
import { Router } from "express";
import FormData from "form-data";
import axios from "axios";
import { client } from "../common";
const router = Router();
/**
 * GET /thumbnail?src=${image url}
 */
router.get("/thumbnail", async (req, res) => {
  if (!req.query.src || !isUrlHttp(String(req.query.src))) {
    res.status(400);
    res.send({ error: "Bad Request." });
    return;
  }
  const src = String(req.query.src);
  const thumbnail = client.db("images").collection("thumbnail");
  const r = await thumbnail.findOne({ original: src });
  if (r) {
    res.redirect(r.thumbnail);
    return;
  }
  let newimage: Buffer;
  try {
    newimage = await imageThumbnail({ uri: src });
  } catch {
    res.status(500);
    res.send({ error: "Error generating thumbnail." });
    return;
  }
  res.setHeader("Content-Type", "image/png");
  res.send(newimage);
  const formData = new FormData();
  formData.append("image", newimage, "image.png");
  await axios
    .post("https://api.na.cx/upload", formData, {
      headers: formData.getHeaders(),
    })
    .then(async (nares) => {
      await thumbnail.insertOne({ original: src, thumbnail: nares.data.url });
    })
    .catch(() => {});
});
export default router;
