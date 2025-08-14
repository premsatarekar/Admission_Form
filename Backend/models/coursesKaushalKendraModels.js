import db from '../config/db.js';

export const getAllCourses = async () => {
  const [rows] = await db.query('SELECT * FROM courses_kaushal_kendra');
  return rows;
};

export const createCourse = async (course) => {
  const { name, fee } = course;
  const [result] = await db.query(
    'INSERT INTO courses_kaushal_kendra (name, fee) VALUES (?, ?)',
    [name, fee]
  );
  return { id: result.insertId, name, fee };
};

export const updateCourse = async (id, course) => {
  const { name, fee } = course;
  await db.query(
    'UPDATE courses_kaushal_kendra SET name = ?, fee = ? WHERE id = ?',
    [name, fee, id]
  );
  return { id, name, fee };
};

export const deleteCourse = async (id) => {
  await db.query('DELETE FROM courses_kaushal_kendra WHERE id = ?', [id]);
  return { id };
};
