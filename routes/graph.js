import express from "express"
const router = express.Router();
import { getTrustGraph } from '../controllers/graphController.js';

router.get('/visualize', getTrustGraph);
export default router;