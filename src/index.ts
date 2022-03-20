import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./router";
const app = express();
dotenv.config();
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(cors());
app.use(router);
app.listen(process.env.port || 3000, function () {
  console.log(`listening at port ${process.env.port || 3000}`);
});
