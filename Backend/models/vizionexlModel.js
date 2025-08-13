import db from '../config/db.js';

export const createVizionexl = async (data) => {
  try {
    const sql = `
      INSERT INTO vizionexl_registrations 
      (full_name, phone_number, email, course_name, admission_date, 
       discount_percent, total_fee, paid_amount, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Format date from DD/MM/YYYY to YYYY-MM-DD for MySQL
    const [day, month, year] = data.date.split('/');
    const mysqlDate = `${year}-${month}-${day}`;

    const values = [
      data.name,
      data.mobile,
      '', // email not in frontend, can be added later
      data.course,
      mysqlDate,
      data.discount || 0,
      data.totalWithGst || 0,
      data.feesPaid || 0,
      `Handed to: ${data.handedTo || 'Rohan'}`,
    ];

    const [result] = await db.query(sql, values);
    return result;
  } catch (err) {
    console.error('createVizionexl database error:', err);
    throw err;
  }
};

export const getVizionexl = async () => {
  try {
    const sql = `
      SELECT 
        id,
        full_name AS name,
        phone_number AS mobile,
        course_name AS course,
        DATE_FORMAT(admission_date, '%d/%m/%Y') AS date,
        discount_percent AS discount,
        total_fee AS totalWithGst,
        paid_amount AS feesPaid,
        balance_amount AS feesRemaining,
        remarks,
        created_at
      FROM vizionexl_registrations 
      ORDER BY admission_date DESC, id DESC
    `;
    const [results] = await db.query(sql);
    return results;
  } catch (err) {
    console.error('getVizionexl database error:', err);
    throw err;
  }
};

export const getVizionexlById = async (id) => {
  try {
    const sql = `
      SELECT 
        id,
        full_name AS name,
        phone_number AS mobile,
        course_name AS course,
        DATE_FORMAT(admission_date, '%d/%m/%Y') AS date,
        discount_percent AS discount,
        total_fee AS totalWithGst,
        paid_amount AS feesPaid,
        balance_amount AS feesRemaining,
        remarks,
        created_at
      FROM vizionexl_registrations 
      WHERE id = ?
    `;
    const [results] = await db.query(sql, [id]);
    return results[0];
  } catch (err) {
    console.error('getVizionexlById database error:', err);
    throw err;
  }
};

export const updateVizionexl = async (id, data) => {
  try {
    const sql = `
      UPDATE vizionexl_registrations 
      SET 
        full_name = ?,
        phone_number = ?,
        course_name = ?,
        admission_date = ?,
        discount_percent = ?,
        total_fee = ?,
        paid_amount = ?,
        remarks = ?
      WHERE id = ?
    `;

    // Format date from DD/MM/YYYY to YYYY-MM-DD for MySQL
    const [day, month, year] = data.date.split('/');
    const mysqlDate = `${year}-${month}-${day}`;

    const values = [
      data.name,
      data.mobile,
      data.course,
      mysqlDate,
      data.discount || 0,
      data.totalWithGst || 0,
      data.feesPaid || 0,
      `Handed to: ${data.handedTo || 'Rohan'}`,
      id,
    ];

    const [result] = await db.query(sql, values);
    return result;
  } catch (err) {
    console.error('updateVizionexl database error:', err);
    throw err;
  }
};

export const deleteVizionexl = async (id) => {
  try {
    const sql = 'DELETE FROM vizionexl_registrations WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    return result;
  } catch (err) {
    console.error('deleteVizionexl database error:', err);
    throw err;
  }
};
