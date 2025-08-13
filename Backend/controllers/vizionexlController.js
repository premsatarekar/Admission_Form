import { body, validationResult } from 'express-validator';
import db from '../config/db.js';
import {
  createVizionexl,
  deleteVizionexl,
  getVizionexl,
  getVizionexlById,
  updateVizionexl,
} from '../models/vizionexlModel.js';

export const validateVizionexl = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Name must contain only letters and spaces'),
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit Indian mobile number'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('address').optional().isString(),
  body('idType')
    .trim()
    .notEmpty()
    .withMessage('ID type is required')
    .isIn(['Aadhar', 'PAN', 'Passport'])
    .withMessage('Invalid ID type'),
  body('idNumber')
    .optional()
    .isString()
    .matches(/^[0-9A-Za-z]*$/)
    .withMessage('Invalid ID number format'),
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('date')
    .notEmpty()
    .withMessage('Admission date is required')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/)
    .withMessage('Invalid date format (use DD/MM/YYYY)'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  body('totalWithGst')
    .notEmpty()
    .withMessage('Total with GST is required')
    .isFloat({ min: 0 })
    .withMessage('Total with GST must be a positive number'),
  body('feesPaid')
    .notEmpty()
    .withMessage('Fees paid is required')
    .isFloat({ min: 0 })
    .withMessage('Fees paid must be a positive number'),
  body('paymentMode')
    .optional()
    .isIn(['Cash', 'PhonePe', 'Cheque'])
    .withMessage('Invalid payment mode'),
  body('upiTransactionId')
    .if(body('paymentMode').equals('PhonePe'))
    .notEmpty()
    .withMessage('UPI Transaction ID is required for PhonePe')
    .matches(/^[0-9A-Za-z]*$/)
    .withMessage('Invalid UPI Transaction ID format'),
  body('upiPaidTo')
    .if(body('paymentMode').equals('PhonePe'))
    .notEmpty()
    .withMessage('UPI Paid To is required for PhonePe')
    .isIn(['Rohan', 'Gururaj'])
    .withMessage('Invalid UPI Paid To value'),
  body('chequeNumber')
    .if(body('paymentMode').equals('Cheque'))
    .notEmpty()
    .withMessage('Cheque number is required for Cheque')
    .matches(/^[0-9]*$/)
    .withMessage('Invalid cheque number format'),
  body('bankName')
    .if(body('paymentMode').equals('Cheque'))
    .notEmpty()
    .withMessage('Bank name is required for Cheque'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a non-negative integer'),
  body('durationUnit')
    .optional()
    .isIn(['days', 'weeks', 'months', 'years'])
    .withMessage('Invalid duration unit'),
  body('handedTo')
    .optional()
    .isIn(['Rohan', 'Gururaj'])
    .withMessage('Invalid handed to value'),
  body('remarks').optional().isString(),
  body('installments')
    .optional()
    .isArray()
    .withMessage('Installments must be an array'),
  body('installments.*.date')
    .optional()
    .isDate()
    .withMessage('Invalid installment date format'),
  body('installments.*.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Installment amount must be a non-negative number'),
];

export const addVizionexl = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      });
    }

    const { course, totalWithGst, feesPaid, installments } = req.body;

    // Validate course exists
    const [courses] = await db.query(
      `SELECT name, fee FROM courses WHERE name = ?`,
      [course]
    );
    if (!courses[0]) {
      return res.status(400).json({
        success: false,
        message: `Course "${course}" not found in the database`,
      });
    }

    // Validate feesPaid against totalWithGst
    const calculatedFeesPaid = installments.reduce(
      (sum, inst) => sum + (parseFloat(inst.amount) || 0),
      0
    );
    if (parseFloat(feesPaid) !== calculatedFeesPaid) {
      return res.status(400).json({
        success: false,
        message: `Fees paid (${feesPaid}) does not match the sum of installment amounts (${calculatedFeesPaid})`,
      });
    }
    if (parseFloat(feesPaid) > parseFloat(totalWithGst)) {
      return res.status(400).json({
        success: false,
        message: `Fees paid (${feesPaid}) cannot exceed total payable amount (${totalWithGst})`,
      });
    }

    const result = await createVizionexl(req.body);

    res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      data: {
        id: result.insertId,
        ...req.body,
        feesRemaining: (
          parseFloat(totalWithGst) - parseFloat(feesPaid)
        ).toFixed(2),
      },
    });
  } catch (err) {
    console.error('addVizionexl error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create registration',
      error: err.message,
    });
  }
};

export const fetchVizionexl = async (req, res) => {
  try {
    const results = await getVizionexl();

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (err) {
    console.error('fetchVizionexl error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: err.message,
    });
  }
};

export const fetchVizionexlById = async (req, res) => {
  try {
    const registration = await getVizionexlById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      data: registration,
    });
  } catch (err) {
    console.error('fetchVizionexlById error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration',
      error: err.message,
    });
  }
};

export const updateVizionexlData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      });
    }

    const { course, totalWithGst, feesPaid, installments } = req.body;

    // Validate course exists
    const [courses] = await db.query(
      `SELECT name, fee FROM courses WHERE name = ?`,
      [course]
    );
    if (!courses[0]) {
      return res.status(400).json({
        success: false,
        message: `Course "${course}" not found in the database`,
      });
    }

    // Validate registration exists
    const registration = await getVizionexlById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    // Validate feesPaid against totalWithGst
    const calculatedFeesPaid = installments.reduce(
      (sum, inst) => sum + (parseFloat(inst.amount) || 0),
      0
    );
    if (parseFloat(feesPaid) !== calculatedFeesPaid) {
      return res.status(400).json({
        success: false,
        message: `Fees paid (${feesPaid}) does not match the sum of installment amounts (${calculatedFeesPaid})`,
      });
    }
    if (parseFloat(feesPaid) > parseFloat(totalWithGst)) {
      return res.status(400).json({
        success: false,
        message: `Fees paid (${feesPaid}) cannot exceed total payable amount (${totalWithGst})`,
      });
    }

    const result = await updateVizionexl(req.params.id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      message: 'Registration updated successfully',
      data: {
        id: req.params.id,
        ...req.body,
        feesRemaining: (
          parseFloat(totalWithGst) - parseFloat(feesPaid)
        ).toFixed(2),
      },
    });
  } catch (err) {
    console.error('updateVizionexlData error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update registration',
      error: err.message,
    });
  }
};

export const removeVizionexl = async (req, res) => {
  try {
    const result = await deleteVizionexl(req.params.id);

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
  } catch (err) {
    console.error('removeVizionexl error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete registration',
      error: err.message,
    });
  }
};

export const markBalancePaid = async (req, res) => {
  try {
    const registration = await getVizionexlById(req.params.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    const isPaid = registration.feesRemaining === 0;
    const newFeesPaid = isPaid ? 0 : registration.totalWithGst;
    const newInstallments = isPaid
      ? []
      : [
          {
            date: new Date().toISOString().split('T')[0],
            amount: registration.totalWithGst,
          },
        ];

    const result = await updateVizionexl(req.params.id, {
      ...registration,
      feesPaid: newFeesPaid,
      totalWithGst: registration.totalWithGst,
      installments: newInstallments,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      message: `Balance marked as ${isPaid ? 'Balance Due' : 'Fully Paid'}`,
      data: {
        id: req.params.id,
        ...registration,
        feesPaid: newFeesPaid,
        feesRemaining: isPaid ? registration.totalWithGst : 0,
        installments: newInstallments,
      },
    });
  } catch (err) {
    console.error('markBalancePaid error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to mark balance paid',
      error: err.message,
    });
  }
};
