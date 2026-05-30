import express from "express"
const router = express.Router();
import  {
  checkFraud,
  checkFraudDemo
} from '../controllers/fraudController.js'

router.post('/check', checkFraud);
router.post('/check-demo', checkFraudDemo);

export default router;