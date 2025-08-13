import db from '../config/db.js';

export const createRegistration = async (req, res) => {
  try {
    const {
      name,
      mobile,
      idType,
      idNumber,
      course,
      registrationPaid,
      amountPaid,
      feesRemaining,
      handedTo,
    } = req.body;

    // Convert registrationPaid to boolean properly
    const isPaid = Boolean(registrationPaid);

    const [result] = await db.query(
      `INSERT INTO kaushal_kendra_registrations 
      (name, mobile, idType, idNumber, course, registrationPaid, amountPaid, feesRemaining, handedTo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        mobile,
        idType,
        idNumber,
        course,
        isPaid,
        amountPaid || 0,
        feesRemaining || 0,
        handedTo,
      ]
    );

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

export const getRegistrations = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM kaushal_kendra_registrations ORDER BY id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const getRegistrationById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM kaushal_kendra_registrations WHERE id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      mobile,
      idType,
      idNumber,
      course,
      registrationPaid,
      amountPaid,
      feesRemaining,
      handedTo,
    } = req.body;

    // Convert registrationPaid to boolean properly
    const isPaid = Boolean(registrationPaid);

    const [result] = await db.query(
      `UPDATE kaushal_kendra_registrations 
      SET name=?, mobile=?, idType=?, idNumber=?, course=?, registrationPaid=?, amountPaid=?, feesRemaining=?, handedTo=?
      WHERE id=?`,
      [
        name,
        mobile,
        idType,
        idNumber,
        course,
        isPaid,
        amountPaid || 0,
        feesRemaining || 0,
        handedTo,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
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
