import express from "express";
import thumbnail from "./router/thumbnail";
import size from "./router/size";
import resize from "./router/resize";
const router = express.Router();
router.use(thumbnail);
router.use(size);
router.use(resize);
export default router;
