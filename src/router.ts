import express from "express";
import thumbnail from "./router/thumbnail";
import size from "./router/size";
import resize from "./router/resize";
const router = express.Router();
router.get("/", (req, res) => {
  return res.redirect("https://gitlab.com/metahkg/metahkg-images");
});
router.use(thumbnail);
router.use(size);
router.use(resize);
export default router;
