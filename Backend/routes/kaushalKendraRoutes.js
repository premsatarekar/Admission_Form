import express from 'express';
import {
  createRegistration,
  deleteRegistration,
  getRegistrationById,
  getRegistrations,
  updateRegistration,
} from '../controllers/kaushalKendraController.js';

const router = express.Router();

router.post('/', createRegistration);
router.get('/', getRegistrations);
router.get('/:id', getRegistrationById);
router.put('/:id', updateRegistration);
router.delete('/:id', deleteRegistration);

export default router;
