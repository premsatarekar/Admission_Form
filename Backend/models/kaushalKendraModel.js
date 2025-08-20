import { format } from 'date-fns';
import db from '../config/db.js';

export const createKaushalKendra = (data, callback) => {
  const sql = `
    INSERT INTO kaushal_kendra_registrations 
    (name, mobile, idType, idNumber, course, registrationPaid, amountPaid, feesRemaining, handedTo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.name,
    data.mobile,
    data.idType,
    data.idNumber,
    data.course,
    data.registrationPaid ? 1 : 0,
    parseFloat(data.amountPaid) || 0,
    parseFloat(data.feesRemaining) || 0,
    data.handedTo,
  ];

  console.log('Executing SQL:', sql);
  console.log('With values:', values);

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return callback(error);
    }

    console.log('Insert results:', results);
    callback(null, results);
  });
};

export const getKaushalKendra = async () => {
  const sql = 'SELECT * FROM kaushal_kendra_registrations ORDER BY id DESC';
  console.log('Executing SQL:', sql);

  try {
    const [rows] = await db.query(sql);
    const processedData = rows.map((row) => {
      const amountPaid = parseFloat(row.amountPaid) || 0;
      const feesRemaining = parseFloat(row.feesRemaining) || 0;
      let status = 'Pending';
      if (feesRemaining === 0 && amountPaid > 0) status = 'Full Paid';
      else if (amountPaid > 0) status = 'Partial Paid';

      return {
        ...row,
        status,
        date: format(new Date(row.date), 'yyyy-MM-dd'), // Ensure consistent date format
      };
    });
    console.log('Query results:', processedData);
    return processedData;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getKaushalKendraById = (id, callback) => {
  const sql = 'SELECT * FROM kaushal_kendra_registrations WHERE id = ?';
  console.log('Executing SQL:', sql, 'with ID:', id);

  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return callback(error);
    }

    const processedResults = results.map((row) => {
      const amountPaid = parseFloat(row.amountPaid) || 0;
      const feesRemaining = parseFloat(row.feesRemaining) || 0;
      let status = 'Pending';
      if (feesRemaining === 0 && amountPaid > 0) status = 'Full Paid';
      else if (amountPaid > 0) status = 'Partial Paid';

      return {
        ...row,
        status,
        date: format(new Date(row.date), 'yyyy-MM-dd'), // Ensure consistent date format
      };
    });

    console.log('Query results:', processedResults);
    callback(null, processedResults);
  });
};

export const updateKaushalKendra = (id, data, callback) => {
  const sql = `
    UPDATE kaushal_kendra_registrations 
    SET name=?, mobile=?, idType=?, idNumber=?, course=?, registrationPaid=?, amountPaid=?, feesRemaining=?, handedTo=?
    WHERE id=?
  `;

  const values = [
    data.name,
    data.mobile,
    data.idType,
    data.idNumber,
    data.course,
    data.registrationPaid ? 1 : 0,
    parseFloat(data.amountPaid) || 0,
    parseFloat(data.feesRemaining) || 0,
    data.handedTo,
    id,
  ];

  console.log('Executing SQL:', sql);
  console.log('With values:', values);

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return callback(error);
    }

    console.log('Update results:', results);
    callback(null, results);
  });
};

export const deleteKaushalKendra = (id, callback) => {
  const sql = 'DELETE FROM kaushal_kendra_registrations WHERE id = ?';
  console.log('Executing SQL:', sql, 'with ID:', id);

  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return callback(error);
    }

    console.log('Delete results:', results);
    callback(null, results);
  });
};
