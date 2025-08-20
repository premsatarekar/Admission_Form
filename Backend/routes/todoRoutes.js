import express from 'express';
import {
  addTodo,
  editTodo,
  fetchTodos,
  removeTodo,
} from '../controllers/todoController.js';

const router = express.Router();

router.post('/', addTodo);
router.get('/', fetchTodos);
router.put('/:id', editTodo);
router.delete('/:id', removeTodo);

export default router;
