import db from '../config/db.js';

export const createVizionexl = async (data) => {
  try {
    const {
      name,
      mobile,
      email,
      address,
      idType,
      idNumber,
      course,
      date,
      discount,
      feesPaid,
      handedTo,
      remarks,
      paymentMode,
      upiTransactionId,
      upiPaidTo,
      chequeNumber,
      bankName,
      duration,
      durationUnit,
      installments,
    } = data;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Fetch course fee from courses table
      const [courses] = await connection.query(
        `SELECT fee FROM courses WHERE name = ?`,
        [course]
      );
      if (!courses[0]) {
        throw new Error(`Course "${course}" not found in the database`);
      }
      const courseFee = Math.round(parseFloat(courses[0].fee) || 0);

      // Perform forward calculations
      const discountPercent = parseFloat(discount) || 0;
      const discountAmount = Math.round((courseFee * discountPercent) / 100);
      const netAmount = Math.round(courseFee - discountAmount);
      const sgst = Math.round(netAmount * 0.09);
      const cgst = Math.round(netAmount * 0.09);
      const totalWithGst = Math.round(netAmount + sgst + cgst);
      const calculatedFeesPaid = Math.round(parseFloat(feesPaid) || 0);
      const balanceAmount = Math.max(0, totalWithGst - calculatedFeesPaid);

      // Format date from DD/MM/YYYY to YYYY-MM-DD for MySQL
      const [day, month, year] = date.split('/');
      const mysqlDate = `${year}-${month}-${day}`;

      const sql = `
        INSERT INTO vizionexl_registrations 
        (full_name, phone_number, email, address, id_type, id_number, course_name, 
         admission_date, discount_percent, course_fee, discount_amount, net_amount, 
         sgst, cgst, total_fee, paid_amount, balance_amount, payment_mode, 
         upi_transaction_id, upi_paid_to, cheque_number, bank_name, duration, 
         duration_unit, handed_to, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        name,
        mobile,
        email || null,
        address || null,
        idType,
        idNumber || null,
        course,
        mysqlDate,
        discountPercent,
        courseFee,
        discountAmount,
        netAmount,
        sgst,
        cgst,
        totalWithGst,
        calculatedFeesPaid,
        balanceAmount,
        paymentMode || 'Cash',
        paymentMode === 'PhonePe' ? upiTransactionId : null,
        paymentMode === 'PhonePe' ? upiPaidTo : null,
        paymentMode === 'Cheque' ? chequeNumber : null,
        paymentMode === 'Cheque' ? bankName : null,
        duration || null,
        durationUnit || 'months',
        handedTo || 'Rohan',
        remarks
          ? `Handed to: ${handedTo}. ${remarks}`
          : `Handed to: ${handedTo}`,
      ];

      const [result] = await connection.query(sql, values);
      const registrationId = result.insertId;

      if (installments && installments.length > 0) {
        const installmentQueries = installments.map((inst) =>
          connection.query(
            `INSERT INTO installments (registration_id, installment_date, amount)
             VALUES (?, ?, ?)`,
            [
              registrationId,
              inst.date,
              Math.round(parseFloat(inst.amount) || 0),
            ]
          )
        );
        await Promise.all(installmentQueries);
      }

      await connection.commit();
      return {
        insertId: registrationId,
        totalWithGst,
        feesRemaining: balanceAmount,
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('createVizionexl database error:', err);
    throw err;
  }
};

export const getVizionexl = async () => {
  try {
    const sql = `
      SELECT 
        r.id,
        r.full_name AS name,
        r.phone_number AS mobile,
        r.email,
        r.address,
        r.id_type AS idType,
        r.id_number AS idNumber,
        r.course_name AS course,
        DATE_FORMAT(r.admission_date, '%d/%m/%Y') AS date,
        r.discount_percent AS discount,
        r.course_fee,
        r.discount_amount,
        r.net_amount,
        r.sgst,
        r.cgst,
        r.total_fee AS totalWithGst,
        r.paid_amount AS feesPaid,
        r.balance_amount AS feesRemaining,
        r.payment_mode AS paymentMode,
        r.upi_transaction_id AS upiTransactionId,
        r.upi_paid_to AS upiPaidTo,
        r.cheque_number AS chequeNumber,
        r.bank_name AS bankName,
        r.duration,
        r.duration_unit AS durationUnit,
        r.handed_to AS handedTo,
        r.remarks,
        r.created_at,
        COALESCE(
          (SELECT JSON_ARRAYAGG(
             JSON_OBJECT(
               'date', i.installment_date,
               'amount', i.amount
             )
           ) FROM installments i WHERE i.registration_id = r.id),
          JSON_ARRAY()
        ) AS installments
      FROM vizionexl_registrations r
      ORDER BY r.admission_date DESC, r.id DESC
    `;
    const [results] = await db.query(sql);
    return results.map((row) => {
      let parsedInstallments = [];
      try {
        parsedInstallments = Array.isArray(row.installments)
          ? row.installments
          : row.installments
          ? JSON.parse(row.installments)
          : [];
      } catch (parseErr) {
        console.error(
          `Failed to parse installments for registration ${row.id}:`,
          {
            raw: row.installments,
            error: parseErr.message,
          }
        );
      }
      return {
        ...row,
        installments: Array.isArray(parsedInstallments)
          ? parsedInstallments
          : [],
      };
    });
  } catch (err) {
    console.error('getVizionexl database error:', err);
    throw err;
  }
};

export const getVizionexlById = async (id) => {
  try {
    const sql = `
      SELECT 
        r.id,
        r.full_name AS name,
        r.phone_number AS mobile,
        r.email,
        r.address,
        r.id_type AS idType,
        r.id_number AS idNumber,
        r.course_name AS course,
        DATE_FORMAT(r.admission_date, '%d/%m/%Y') AS date,
        r.discount_percent AS discount,
        r.course_fee,
        r.discount_amount,
        r.net_amount,
        r.sgst,
        r.cgst,
        r.total_fee AS totalWithGst,
        r.paid_amount AS feesPaid,
        r.balance_amount AS feesRemaining,
        r.payment_mode AS paymentMode,
        r.upi_transaction_id AS upiTransactionId,
        r.upi_paid_to AS upiPaidTo,
        r.cheque_number AS chequeNumber,
        r.bank_name AS bankName,
        r.duration,
        r.duration_unit AS durationUnit,
        r.handed_to AS handedTo,
        r.remarks,
        r.created_at,
        COALESCE(
          (SELECT JSON_ARRAYAGG(
             JSON_OBJECT(
               'date', i.installment_date,
               'amount', i.amount
             )
           ) FROM installments i WHERE i.registration_id = r.id),
          JSON_ARRAY()
        ) AS installments
      FROM vizionexl_registrations r
      WHERE r.id = ?
    `;
    const [results] = await db.query(sql, [id]);
    if (!results[0]) return null;
    let parsedInstallments = [];
    try {
      parsedInstallments = Array.isArray(results[0].installments)
        ? results[0].installments
        : results[0].installments
        ? JSON.parse(results[0].installments)
        : [];
    } catch (parseErr) {
      console.error(`Failed to parse installments for registration ${id}:`, {
        raw: results[0].installments,
        error: parseErr.message,
      });
    }
    return {
      ...results[0],
      installments: Array.isArray(parsedInstallments) ? parsedInstallments : [],
    };
  } catch (err) {
    console.error('getVizionexlById database error:', err);
    throw err;
  }
};

export const updateVizionexl = async (id, data) => {
  try {
    const {
      name,
      mobile,
      email,
      address,
      idType,
      idNumber,
      course,
      date,
      discount,
      feesPaid,
      handedTo,
      remarks,
      paymentMode,
      upiTransactionId,
      upiPaidTo,
      chequeNumber,
      bankName,
      duration,
      durationUnit,
      installments,
    } = data;

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Fetch course fee from courses table
      const [courses] = await connection.query(
        `SELECT fee FROM courses WHERE name = ?`,
        [course]
      );
      if (!courses[0]) {
        throw new Error(`Course "${course}" not found in the database`);
      }
      const courseFee = Math.round(parseFloat(courses[0].fee) || 0);

      // Perform forward calculations
      const discountPercent = parseFloat(discount) || 0;
      const discountAmount = Math.round((courseFee * discountPercent) / 100);
      const netAmount = Math.round(courseFee - discountAmount);
      const sgst = Math.round(netAmount * 0.09);
      const cgst = Math.round(netAmount * 0.09);
      const totalWithGst = Math.round(netAmount + sgst + cgst);
      const calculatedFeesPaid = Math.round(parseFloat(feesPaid) || 0);
      const balanceAmount = Math.max(0, totalWithGst - calculatedFeesPaid);

      // Format date from DD/MM/YYYY to YYYY-MM-DD for MySQL
      const [day, month, year] = date.split('/');
      const mysqlDate = `${year}-${month}-${day}`;

      const sql = `
        UPDATE vizionexl_registrations 
        SET 
          full_name = ?,
          phone_number = ?,
          email = ?,
          address = ?,
          id_type = ?,
          id_number = ?,
          course_name = ?,
          admission_date = ?,
          discount_percent = ?,
          course_fee = ?,
          discount_amount = ?,
          net_amount = ?,
          sgst = ?,
          cgst = ?,
          total_fee = ?,
          paid_amount = ?,
          balance_amount = ?,
          payment_mode = ?,
          upi_transaction_id = ?,
          upi_paid_to = ?,
          cheque_number = ?,
          bank_name = ?,
          duration = ?,
          duration_unit = ?,
          handed_to = ?,
          remarks = ?
        WHERE id = ?
      `;
      const values = [
        name,
        mobile,
        email || null,
        address || null,
        idType,
        idNumber || null,
        course,
        mysqlDate,
        discountPercent,
        courseFee,
        discountAmount,
        netAmount,
        sgst,
        cgst,
        totalWithGst,
        calculatedFeesPaid,
        balanceAmount,
        paymentMode || 'Cash',
        paymentMode === 'PhonePe' ? upiTransactionId : null,
        paymentMode === 'PhonePe' ? upiPaidTo : null,
        paymentMode === 'Cheque' ? chequeNumber : null,
        paymentMode === 'Cheque' ? bankName : null,
        duration || null,
        durationUnit || 'months',
        handedTo || 'Rohan',
        remarks
          ? `Handed to: ${handedTo}. ${remarks}`
          : `Handed to: ${handedTo}`,
        id,
      ];

      const [result] = await connection.query(sql, values);

      // Delete existing installments
      await connection.query(
        `DELETE FROM installments WHERE registration_id = ?`,
        [id]
      );

      // Insert new installments
      if (installments && installments.length > 0) {
        const installmentQueries = installments.map((inst) =>
          connection.query(
            `INSERT INTO installments (registration_id, installment_date, amount)
             VALUES (?, ?, ?)`,
            [id, inst.date, Math.round(parseFloat(inst.amount) || 0)]
          )
        );
        await Promise.all(installmentQueries);
      }

      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('updateVizionexl database error:', err);
    throw err;
  }
};

export const deleteVizionexl = async (id) => {
  try {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `DELETE FROM installments WHERE registration_id = ?`,
        [id]
      );
      const [result] = await connection.query(
        `DELETE FROM vizionexl_registrations WHERE id = ?`,
        [id]
      );
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('deleteVizionexl database error:', err);
    throw err;
  }
};
