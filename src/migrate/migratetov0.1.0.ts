import sizeOf from "buffer-image-size";
import { MongoClient } from "mongodb";
import { mongouri } from "../common";
import axios from "axios";
async function main() {
  const client = new MongoClient(mongouri);
  await client.connect();
  const thumbnail = client.db("images").collection("thumbnail");
  const images = client.db("images").collection("images");
  await thumbnail.find().forEach((item) => {
    (async () => {
      if (!(await images.findOne({ original: item.original }))) {
        const dimensions = sizeOf(
          Buffer.from(
            (await axios.get(item.thumbnail, { responseType: "arraybuffer" }))
              .data,
            "utf-8"
          )
        );
        images.insertOne({
          original: item.original,
          thumbnail: item.thumbnail,
          thumbnailHeight: dimensions.height,
          thumbnailWidth: dimensions.width,
        });
      }
    })();
  });
}
main();
