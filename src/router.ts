import express from 'express';
import thumbnail from './router/thumbnail'
const router = express.Router();
router.use(thumbnail);
export default router;