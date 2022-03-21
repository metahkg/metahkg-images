import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./router";
import { client } from "./common";
const app = express();
dotenv.config();
client.connect();
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(cors());
app.use(router);
app.listen(process.env.port || 3000, function () {
  console.log(`listening at port ${process.env.port || 3000}`);
});
