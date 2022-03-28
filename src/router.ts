import express from "express";
import thumbnail from "./router/thumbnail";
import size from "./router/size";
const router = express.Router();
router.use(thumbnail);
router.use(size);
export default router;
