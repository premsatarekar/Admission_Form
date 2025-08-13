import {
  createVizionexl as createVizionexlModel,
  deleteVizionexl as deleteVizionexlModel,
  getVizionexl,
  getVizionexlById,
  updateVizionexl as updateVizionexlModel,
} from '../models/vizionexlModel.js';

export const addVizionexl = async (req, res) => {
  try {
    const requiredFields = ['name', 'mobile', 'course', 'feesPaid'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    if (!/^[6-9]\d{9}$/.test(req.body.mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 10-digit Indian mobile number',
      });
    }

    if (parseFloat(req.body.feesPaid) > req.body.totalWithGst) {
      return res.status(400).json({
        success: false,
        message: 'Fees Paid cannot exceed total payable amount',
      });
    }

    const result = await createVizionexlModel(req.body);

    res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      data: {
        id: result.insertId,
        ...req.body,
        feesRemaining: (req.body.totalWithGst - req.body.feesPaid).toFixed(2),
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
    const requiredFields = ['name', 'mobile', 'course', 'feesPaid'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    if (!/^[6-9]\d{9}$/.test(req.body.mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 10-digit Indian mobile number',
      });
    }

    if (parseFloat(req.body.feesPaid) > req.body.totalWithGst) {
      return res.status(400).json({
        success: false,
        message: 'Fees Paid cannot exceed total payable amount',
      });
    }

    const result = await updateVizionexlModel(req.params.id, req.body);

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
        feesRemaining: (req.body.totalWithGst - req.body.feesPaid).toFixed(2),
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
    const result = await deleteVizionexlModel(req.params.id);

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

    const result = await updateVizionexlModel(req.params.id, {
      ...registration,
      feesPaid: registration.totalWithGst,
      totalWithGst: registration.totalWithGst,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    res.json({
      success: true,
      message: 'Balance marked as paid successfully',
      data: {
        id: req.params.id,
        ...registration,
        feesPaid: registration.totalWithGst,
        feesRemaining: 0,
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
