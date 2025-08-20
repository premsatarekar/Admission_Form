import db from '../config/db.js';

export const createTodo = async (title, done = false) => {
  const [result] = await db.query(
    'INSERT INTO todos (title, done) VALUES (?, ?)',
    [title, done]
  );
  return result;
};

export const getTodos = async () => {
  const [rows] = await db.query('SELECT * FROM todos');
  return rows;
};

export const updateTodo = async (id, title, done) => {
  const [result] = await db.query(
    'UPDATE todos SET title = ?, done = ? WHERE id = ?',
    [title, done, id]
  );
  return result;
};

export const deleteTodo = async (id) => {
  const [result] = await db.query('DELETE FROM todos WHERE id = ?', [id]);
  return result;
};