import { Router } from "express";
import sizeOf from "buffer-image-size";
import isUrlHttp from "is-url-http";
import axios from "axios";
import { client } from "../common";
const router = Router();
router.get("/size", async (req, res) => {
  const src = decodeURIComponent(String(req.query.src));
  if (!req.query.src || !isUrlHttp(src)) {
    res.status(400);
    res.send({ error: "Bad Request." });
    return;
  }
  const images = client.db("images").collection("images");
  const image = await images.findOne({ original: src });
  if (image?.width && image?.height) {
    res.send({ width: image.width, height: image.height });
    return;
  }
  axios
    .get(src, { responseType: "arraybuffer" })
    .then((imgres) => {
      try {
        const fetchedimg = Buffer.from(imgres.data, "utf-8");
        const dimensions = sizeOf(fetchedimg);
        res.send({ height: dimensions.height, width: dimensions.width });
        const insertContent = {
          original: src,
          width: dimensions.width,
          height: dimensions.height,
        };
        if (!image) images.insertOne(insertContent);
        else images.updateOne({ original: src }, { $set: insertContent });
      } catch (err) {
        res.status(500);
        res.send({ error: "Error getting size." });
        return;
      }
    })
    .catch(() => {
      res.status(500);
      res.send({ error: "Error fetching image." });
    });
});
export default router;
