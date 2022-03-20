import imageThumbnail from "image-thumbnail";
import isUrlHttp from "is-url-http";
import { Router } from "express";
import FormData from "form-data";
import axios from "axios";
import { MongoClient } from "mongodb";
import { mongouri } from "../common";
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
  const client = new MongoClient(mongouri);
  await client.connect();
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
  const formData = new FormData();
  formData.append("image", newimage, "image.png");
  await axios
    .post("https://api.na.cx/upload", formData, {
      headers: formData.getHeaders(),
    })
    .then((nares) => {
      res.redirect(nares.data.url);
      thumbnail.insertOne({ original: src, thumbnail: nares.data.url });
    })
    .catch(() => {
      res.setHeader("Content-Type", "image/png");
      res.send(newimage);
    });
});
export default router;
