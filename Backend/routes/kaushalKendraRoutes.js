import express from 'express';
import {
  createRegistration,
  deleteRegistration,
  getRegistrationById,
  getRegistrations,
  markBalancePaid,
  updateRegistration,
} from '../controllers/kaushalKendraController.js';

const router = express.Router();

router.post('/', createRegistration);
router.get('/', getRegistrations);
router.get('/:id', getRegistrationById);
router.patch('/:id', updateRegistration);
router.delete('/:id', deleteRegistration);
router.patch('/:id/mark-paid', markBalancePaid);

export default router;
