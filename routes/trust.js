import express from "express"
const router = express.Router();
import {
  calculateTrustScore,
  getTrustScore,
  recalculateTrustScore
} from '../controllers/trustController.js';

router.post('/calculate', calculateTrustScore);
router.get('/:merchantId', getTrustScore);
router.post('/recalculate/:merchantId', recalculateTrustScore);

export default router;