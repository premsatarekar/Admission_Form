import express from 'express';
import {
  addVizionexl,
  fetchVizionexl,
  fetchVizionexlById,
  markBalancePaid,
  removeVizionexl,
  updateVizionexlData,
} from '../controllers/vizionexlController.js';

const router = express.Router();

router.post('/', addVizionexl);
router.get('/', fetchVizionexl);
router.get('/:id', fetchVizionexlById);
router.put('/:id', updateVizionexlData);
router.delete('/:id', removeVizionexl);
router.patch('/:id/mark-paid', markBalancePaid);

export default router;
