import imageThumbnail from "image-thumbnail";
import isUrlHttp from "is-url-http";
import { Router } from "express";
import FormData from "form-data";
import axios from "axios";
import { client } from "../common";
import sizeOf from "buffer-image-size";
const router = Router();
/**
 * GET /thumbnail?src=${image url}
 */
router.get("/thumbnail", async (req, res) => {
  const src = decodeURIComponent(String(req.query.src));
  if (!req.query.src || !isUrlHttp(src)) {
    res.status(400);
    res.send({ error: "Bad Request." });
    return;
  }
  const images = client.db("images").collection("images");
  const r = await images.findOne({ original: src });
  if (r?.thumbnail) {
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
      const dimensions = sizeOf(newimage);
      const insertContent = {
        original: src,
        thumbnail: nares.data.url,
        thumbnailHeight: dimensions.height,
        thumbnailWidth: dimensions.width,
      };
      if (!r) await images.insertOne(insertContent);
      else await images.updateOne({ original: src }, { $set: insertContent });
    })
    .catch(() => {});
});
export default router;
