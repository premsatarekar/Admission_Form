import db from '../config/db.js';

export const createCourse = async (name, fee) => {
  const [result] = await db.query(
    'INSERT INTO courses (name, fee) VALUES (?, ?)',
    [name, fee]
  );
  return result;
};

export const getCourses = async () => {
  const [rows] = await db.query('SELECT * FROM courses');
  return rows;
};

export const updateCourse = async (id, name, fee) => {
  const [result] = await db.query(
    'UPDATE courses SET name = ?, fee = ? WHERE id = ?',
    [name, fee, id]
  );
  return result;
};

export const deleteCourse = async (id) => {
  const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
  return result;
};
