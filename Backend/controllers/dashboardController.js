import db from '../config/db.js';

// Format currency for INR
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getDashboardStats = async (req, res) => {
  try {
    // Get Vizionexl stats
    const [vizionexlStats] = await db.query(`
      SELECT 
        COUNT(*) as totalStudents,
        SUM(paid_amount) as amountCollected,
        SUM(balance_amount) as pendingAmount
      FROM vizionexl_registrations
    `);

    // Get Kaushal Kendra stats
    const [kaushalStats] = await db.query(`
      SELECT 
        COUNT(*) as totalStudents,
        SUM(amountPaid) as amountCollected,
        SUM(feesRemaining) as pendingAmount
      FROM kaushal_kendra_registrations
    `);

    // Combine stats
    const combinedStats = {
      totalStudents:
        vizionexlStats[0].totalStudents + kaushalStats[0].totalStudents,
      amountCollected:
        vizionexlStats[0].amountCollected + kaushalStats[0].amountCollected,
      pendingAmount:
        vizionexlStats[0].pendingAmount + kaushalStats[0].pendingAmount,
    };

    res.json({
      success: true,
      data: {
        ...combinedStats,
        amountCollectedFormatted: formatINR(combinedStats.amountCollected),
        pendingAmountFormatted: formatINR(combinedStats.pendingAmount),
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRecentRegistrations = async (req, res) => {
  try {
    const [registrations] = await db.query(`
      (SELECT 
        id, full_name as name, course_name as course, 
        created_at as date, payment_mode as paymentType,
        'vizionexl' as source
       FROM vizionexl_registrations
       ORDER BY created_at DESC
       LIMIT 3)
       
      UNION ALL
       
      (SELECT 
        id, name, course as course, 
        createdAt as date, paymentMode as paymentType,
        'kaushal' as source
       FROM kaushal_kendra_registrations
       ORDER BY createdAt DESC
       LIMIT 2)
       
      ORDER BY date DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: registrations.map((reg) => ({
        ...reg,
        date: new Date(reg.date).toLocaleString(),
      })),
    });
  } catch (error) {
    console.error('Recent registrations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCourseDistribution = async (req, res) => {
  try {
    const [vizionexlCourses] = await db.query(`
      SELECT course_name as name, COUNT(*) as count 
      FROM vizionexl_registrations
      GROUP BY course_name
    `);

    const [kaushalCourses] = await db.query(`
      SELECT course as name, COUNT(*) as count 
      FROM kaushal_kendra_registrations
      GROUP BY course
    `);

    // Combine and sum counts for same course names
    const combinedCourses = [...vizionexlCourses, ...kaushalCourses].reduce(
      (acc, course) => {
        const existing = acc.find((c) => c.name === course.name);
        if (existing) {
          existing.count += course.count;
        } else {
          acc.push(course);
        }
        return acc;
      },
      []
    );

    res.json({ success: true, data: combinedCourses });
  } catch (error) {
    console.error('Course distribution error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPaymentHandlers = async (req, res) => {
  try {
    const [handlers] = await db.query(`
      (SELECT 
        handed_to as name, 
        COUNT(*) as students,
        SUM(paid_amount) as amount,
        'vizionexl' as source
       FROM vizionexl_registrations
       GROUP BY handed_to)
       
      UNION ALL
       
      (SELECT 
        handedTo as name,
        COUNT(*) as students,
        SUM(amountPaid) as amount,
        'kaushal' as source
       FROM kaushal_kendra_registrations
       GROUP BY handedTo)
       
      ORDER BY amount DESC
      LIMIT 3
    `);

    res.json({
      success: true,
      data: handlers.map((handler) => ({
        ...handler,
        amountFormatted: formatINR(handler.amount),
      })),
    });
  } catch (error) {
    console.error('Payment handlers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
