import imageThumbnail from "image-thumbnail";
import isUrlHttp from "is-url-http";
import { Router } from "express";
import FormData from "form-data";
import axios from "axios";
import { imagesCl } from "../common";
import sizeOf from "buffer-image-size";
const router = Router();
/**
 * GET /thumbnail?src=${image url}
 */
router.get("/thumbnail", async (req, res) => {
  const src = decodeURIComponent(String(req.query.src));

  if (!req.query.src || !isUrlHttp(src))
    return res.status(400).send({ error: "Bad Request." });
  
  const image = await imagesCl.findOne({ original: src });

  if (image?.thumbnail) return res.redirect(image.thumbnail);

  let newimage: Buffer;

  try {
    newimage = await imageThumbnail({ uri: src });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Error generating thumbnail." });
  }

  res.setHeader("Content-Type", "image/png").send(newimage);

  const formData = new FormData();
  formData.append("image", newimage, "image.png");

  await axios
    .post("https://api.na.cx/upload", formData, {
      headers: formData.getHeaders(),
    })
    .then(async (nares: { data: { url: string } }) => {
      const dimensions = sizeOf(newimage);

      const insertContent = {
        original: src,
        thumbnail: nares.data.url,
        thumbnailHeight: dimensions.height,
        thumbnailWidth: dimensions.width,
      };

      if (!image) await imagesCl.insertOne(insertContent);

      else await imagesCl.updateOne({ original: src }, { $set: insertContent });
    })
    .catch((err) => {
      console.error(err);
    });
});
export default router;
