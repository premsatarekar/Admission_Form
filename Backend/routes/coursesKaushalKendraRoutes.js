import express from 'express';
import {
  addCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from '../controllers/coursesKaushalKendra.js';

const router = express.Router();

router.get('/', getCourses);
router.post('/', addCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
