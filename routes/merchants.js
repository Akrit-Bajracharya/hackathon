import express from "express"
const router = express.Router();
import {
  onboardMerchant,
  getMerchant,
  getAllMerchants,
  addGuarantor,
  onboardWithVoice
} from '../controllers/merchantController.js';

router.post('/onboard', onboardMerchant);
router.post('/onboard-voice', onboardWithVoice);
router.get('/', getAllMerchants);
router.get('/:id', getMerchant);
router.post('/:id/guarantors', addGuarantor);

export default   router;