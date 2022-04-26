import { Router } from "express";
import sizeOf from "buffer-image-size";
import isUrlHttp from "is-url-http";
import axios from "axios";
import { imagesCl } from "../common";
const router = Router();
router.get("/size", async (req, res) => {
  const src = decodeURIComponent(String(req.query.src));

  if (!req.query.src || !isUrlHttp(src))
    return res.status(400).send({ error: "Bad Request." });

  const image = await imagesCl.findOne({ original: src });

  if (image?.width && image?.height)
    return res.send({ width: image.width, height: image.height });

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
        if (!image) imagesCl.insertOne(insertContent);
        else imagesCl.updateOne({ original: src }, { $set: insertContent });
      } catch (err) {
        console.error(err);
        return res.status(500).send({ error: "Error getting size." });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).send({ error: "Error fetching image." });
    });
});
export default router;
