import { format } from 'date-fns';
import db from '../config/db.js';

// Helper to parse DD/MM/YYYY or YYYY-MM-DD to YYYY-MM-DD
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr.split('T')[0]; // Remove time component if present
};

// Helper to validate input data
const validateRegistrationData = (data) => {
  const errors = [];
  if (
    !data.name ||
    typeof data.name !== 'string' ||
    data.name.trim().length === 0
  ) {
    errors.push('Name is required and must be a non-empty string');
  }
  if (!data.mobile || !/^[6-9]\d{9}$/.test(data.mobile)) {
    errors.push('Valid 10-digit Indian mobile number is required');
  }
  if (!data.course || typeof data.course !== 'string') {
    errors.push('Course is required and must be a string');
  }
  if (data.courseFee && isNaN(parseFloat(data.courseFee))) {
    errors.push('Course fee must be a valid number');
  }
  if (data.discount && isNaN(parseFloat(data.discount))) {
    errors.push('Discount must be a valid number');
  }
  if (data.amountPaid && isNaN(parseFloat(data.amountPaid))) {
    errors.push('Amount paid must be a valid number');
  }
  if (
    data.paymentMode &&
    !['Cash', 'PhonePe', 'Cheque'].includes(data.paymentMode)
  ) {
    errors.push('Payment mode must be Cash, PhonePe, or Cheque');
  }
  if (data.paymentMode === 'PhonePe' && (!data.utrNumber || !data.upiPaidTo)) {
    errors.push('UTR number and UPI Paid To are required for PhonePe payments');
  }
  if (data.paymentMode === 'Cheque' && (!data.chequeNumber || !data.bankName)) {
    errors.push('Cheque number and bank name are required for Cheque payments');
  }
  if (data.installments && Array.isArray(data.installments)) {
    const totalInstallments = data.installments.reduce(
      (sum, inst) => sum + (parseFloat(inst.amount) || 0),
      0
    );
    if (parseFloat(data.amountPaid) !== totalInstallments) {
      errors.push('Amount paid must equal the sum of installment amounts');
    }
  }
  return errors;
};

// Create a new registration
export const createRegistration = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      address,
      idType,
      idNumber,
      course,
      registrationPaid,
      amountPaid,
      courseFee,
      discount,
      handedTo,
      paymentMode,
      utrNumber,
      upiPaidTo,
      bankName,
      chequeNumber,
      date,
      duration,
      durationUnit,
      installments,
    } = req.body;

    // Validate input
    const errors = validateRegistrationData(req.body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: errors.join(', ') });
    }

    // Parse and format date
    const parsedDate = parseDate(date);
    const formattedDate = parsedDate
      ? format(new Date(parsedDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');

    // Fetch course fee from courses_kaushal_kendra
    const [courseRows] = await db.query(
      'SELECT fee FROM courses_kaushal_kendra WHERE name = ?',
      [course]
    );
    if (!courseRows.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid course selected' });
    }
    const dbCourseFee = parseFloat(courseRows[0].fee);
    const inputCourseFee = parseFloat(courseFee) || dbCourseFee;
    if (inputCourseFee !== dbCourseFee) {
      return res
        .status(400)
        .json({ success: false, message: 'Course fee mismatch' });
    }

    const discountPercent = parseFloat(discount) || 0;
    const discountAmount = (inputCourseFee * discountPercent) / 100;

    // Dynamically build columns and values
    const columns = [
      'name',
      'mobile',
      'email',
      'address',
      'idType',
      'idNumber',
      'course',
      'registrationPaid',
      'amountPaid',
      'courseFee',
      'discount',
      'discountAmount',
      'handedTo',
      'paymentMode',
      'date',
    ];
    const values = [
      name,
      mobile,
      email || null,
      address || null,
      idType || null,
      idNumber || null,
      course,
      Boolean(registrationPaid),
      parseFloat(amountPaid) || 0,
      inputCourseFee,
      discountPercent,
      discountAmount,
      handedTo || null,
      paymentMode || 'Cash',
      formattedDate,
    ];

    // Conditionally add optional fields
    if (paymentMode === 'PhonePe') {
      columns.push('utrNumber', 'upiPaidTo');
      values.push(utrNumber || null, upiPaidTo || null);
    }
    if (paymentMode === 'Cheque') {
      columns.push('chequeNumber', 'bankName');
      values.push(chequeNumber || null, bankName || null);
    }
    if (duration && durationUnit) {
      columns.push('duration', 'durationUnit');
      values.push(parseInt(duration) || null, durationUnit || null);
    } else if (duration || durationUnit) {
      // Ensure both duration and durationUnit are provided together
      return res.status(400).json({
        success: false,
        message: 'Both duration and durationUnit must be provided together',
      });
    }

    // Construct and log the SQL query
    const sql = `
      INSERT INTO kaushal_kendra_registrations 
      (${columns.join(', ')})
      VALUES (${columns.map(() => '?').join(', ')})
    `;
    console.log('Executing SQL:', sql);
    console.log('With values:', values);

    const [result] = await db.query(sql, values);

    // Handle installments
    if (installments && Array.isArray(installments)) {
      for (const inst of installments) {
        const instDate = parseDate(inst.date) || formattedDate;
        await db.query(
          `INSERT INTO kaushal_kendra_installments (registrationId, installmentDate, amount)
           VALUES (?, ?, ?)`,
          [result.insertId, instDate, parseFloat(inst.amount) || 0]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get all registrations
export const getRegistrations = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, 
             (SELECT JSON_ARRAYAGG(
                JSON_OBJECT('date', i.installmentDate, 'amount', i.amount)
             ) FROM kaushal_kendra_installments i WHERE i.registrationId = r.id) as installments
      FROM kaushal_kendra_registrations r
      ORDER BY r.id DESC
    `);

    // Process data to match frontend expectations
    const processedData = rows.map((row) => {
      const amountPaid = parseFloat(row.amountPaid) || 0;
      const feesRemaining = parseFloat(row.feesRemaining) || 0;
      let status = 'Pending';
      if (feesRemaining === 0 && amountPaid > 0) status = 'Full Paid';
      else if (amountPaid > 0) status = 'Partial Paid';

      // Handle installments
      let installmentsData = [];
      if (row.installments) {
        if (typeof row.installments === 'string') {
          try {
            installmentsData = JSON.parse(row.installments);
          } catch (parseError) {
            console.error(
              `Error parsing installments for row ${row.id}:`,
              parseError
            );
            installmentsData = [];
          }
        } else if (Array.isArray(row.installments)) {
          installmentsData = row.installments;
        }
      }

      return {
        ...row,
        installments: installmentsData,
        status,
        date: format(new Date(row.date), 'yyyy-MM-dd'), // Ensure consistent date format
      };
    });

    res.json({ success: true, data: processedData });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get registration by ID
export const getRegistrationById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, 
              (SELECT JSON_ARRAYAGG(
                 JSON_OBJECT('date', i.installmentDate, 'amount', i.amount)
              ) FROM kaushal_kendra_installments i WHERE i.registrationId = r.id) as installments
       FROM kaushal_kendra_registrations r
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    const row = rows[0];
    const amountPaid = parseFloat(row.amountPaid) || 0;
    const feesRemaining = parseFloat(row.feesRemaining) || 0;
    let status = 'Pending';
    if (feesRemaining === 0 && amountPaid > 0) status = 'Full Paid';
    else if (amountPaid > 0) status = 'Partial Paid';

    // Handle installments
    let installmentsData = [];
    if (row.installments) {
      if (typeof row.installments === 'string') {
        try {
          installmentsData = JSON.parse(row.installments);
        } catch (parseError) {
          console.error(
            `Error parsing installments for row ${row.id}:`,
            parseError
          );
          installmentsData = [];
        }
      } else if (Array.isArray(row.installments)) {
        installmentsData = row.installments;
      }
    }

    res.json({
      success: true,
      data: {
        ...row,
        installments: installmentsData,
        status,
        date: format(new Date(row.date), 'yyyy-MM-dd'), // Ensure consistent date format
      },
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update registration
export const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      mobile,
      email,
      address,
      idType,
      idNumber,
      course,
      registrationPaid,
      amountPaid,
      courseFee,
      discount,
      handedTo,
      paymentMode,
      utrNumber,
      upiPaidTo,
      bankName,
      chequeNumber,
      date,
      duration,
      durationUnit,
      installments,
    } = req.body;

    // Validate input
    const errors = validateRegistrationData(req.body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: errors.join(', ') });
    }

    // Parse and format date
    const parsedDate = parseDate(date);
    const formattedDate = parsedDate
      ? format(new Date(parsedDate), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');

    // Fetch course fee from courses_kaushal_kendra
    const [courseRows] = await db.query(
      'SELECT fee FROM courses_kaushal_kendra WHERE name = ?',
      [course]
    );
    if (!courseRows.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid course selected' });
    }
    const dbCourseFee = parseFloat(courseRows[0].fee);
    const inputCourseFee = parseFloat(courseFee) || dbCourseFee;
    if (inputCourseFee !== dbCourseFee) {
      return res
        .status(400)
        .json({ success: false, message: 'Course fee mismatch' });
    }

    const discountPercent = parseFloat(discount) || 0;
    const discountAmount = (inputCourseFee * discountPercent) / 100;

    // Dynamically build columns and values for update
    const columns = [
      'name',
      'mobile',
      'email',
      'address',
      'idType',
      'idNumber',
      'course',
      'registrationPaid',
      'amountPaid',
      'courseFee',
      'discount',
      'discountAmount',
      'handedTo',
      'paymentMode',
      'date',
    ];
    const values = [
      name,
      mobile,
      email || null,
      address || null,
      idType || null,
      idNumber || null,
      course,
      Boolean(registrationPaid),
      parseFloat(amountPaid) || 0,
      inputCourseFee,
      discountPercent,
      discountAmount,
      handedTo || null,
      paymentMode || 'Cash',
      formattedDate,
    ];

    if (paymentMode === 'PhonePe') {
      columns.push('utrNumber', 'upiPaidTo');
      values.push(utrNumber || null, upiPaidTo || null);
    }
    if (paymentMode === 'Cheque') {
      columns.push('chequeNumber', 'bankName');
      values.push(chequeNumber || null, bankName || null);
    }
    if (duration && durationUnit) {
      columns.push('duration', 'durationUnit');
      values.push(parseInt(duration) || null, durationUnit || null);
    } else if (duration || durationUnit) {
      return res.status(400).json({
        success: false,
        message: 'Both duration and durationUnit must be provided together',
      });
    }

    const sql = `
      UPDATE kaushal_kendra_registrations 
      SET ${columns.map((col) => `${col}=?`).join(', ')}
      WHERE id=?
    `;
    values.push(id);

    console.log('Executing SQL:', sql);
    console.log('With values:', values);

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    // Update installments
    if (installments && Array.isArray(installments)) {
      await db.query(
        `DELETE FROM kaushal_kendra_installments WHERE registrationId = ?`,
        [id]
      );
      for (const inst of installments) {
        const instDate = parseDate(inst.date) || formattedDate;
        await db.query(
          `INSERT INTO kaushal_kendra_installments (registrationId, installmentDate, amount)
           VALUES (?, ?, ?)`,
          [id, instDate, parseFloat(inst.amount) || 0]
        );
      }
    }

    res.json({
      success: true,
      message: 'Registration updated successfully',
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Delete registration
export const deleteRegistration = async (req, res) => {
  try {
    const [result] = await db.query(
      `DELETE FROM kaushal_kendra_registrations WHERE id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    await db.query(
      `DELETE FROM kaushal_kendra_installments WHERE registrationId = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Registration deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Mark registration as paid
export const markBalancePaid = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT amountPaid, feesRemaining, totalWithGst FROM kaushal_kendra_registrations WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    const { amountPaid, feesRemaining, totalWithGst } = rows[0];
    const isPaid = feesRemaining === 0 && amountPaid > 0;

    const newAmountPaid = isPaid ? 0 : parseFloat(totalWithGst);
    const newFeesRemaining = isPaid ? parseFloat(totalWithGst) : 0;

    const [result] = await db.query(
      `UPDATE kaushal_kendra_registrations 
       SET amountPaid = ?, feesRemaining = ?, registrationPaid = ?
       WHERE id = ?`,
      [newAmountPaid, newFeesRemaining, !isPaid, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      message: `Registration marked as ${
        isPaid ? 'Balance Due' : 'Fully Paid'
      }`,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
