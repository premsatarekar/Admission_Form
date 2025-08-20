import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from '../models/todoModel.js';

export const addTodo = async (req, res) => {
  try {
    const { title, done } = req.body;
    await createTodo(title, done);
    res.status(201).json({ message: 'Todo added' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to add todo' });
  }
};

export const fetchTodos = async (req, res) => {
  try {
    const results = await getTodos();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch todos' });
  }
};

export const editTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, done } = req.body;
    await updateTodo(id, title, done);
    res.json({ message: 'Todo updated' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update todo' });
  }
};

export const removeTodo = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTodo(id);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete todo' });
  }
};
