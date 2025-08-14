import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  FaArrowLeft,
  FaBook,
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaFileAlt,
  FaFileInvoice,
  FaHome,
  FaIdCard,
  FaMobileAlt,
  FaMoneyBillWave,
  FaPercent,
  FaPhone,
  FaPlus,
  FaRegIdCard,
  FaTrash,
  FaUser,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import kaushalKendraLogo from '../assets/kaushal-kendra-logo.jpg';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function KaushalKendraEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const timerRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    idType: 'Aadhar',
    idNumber: '',
    course: '',
    discount: '',
    courseFee: '',
    amountPaid: '',
    handedTo: 'Rohan',
    remarks: '',
    date: '',
    paymentMode: 'Cash',
    utrNumber: '',
    chequeNumber: '',
    bankName: '',
    upiPaidTo: '',
    duration: '',
    durationUnit: 'months',
    registrationPaid: false,
  });

  const [courses, setCourses] = useState([]);
  const [calcs, setCalcs] = useState({
    courseFee: 0,
    discountAmount: 0,
    netAmount: 0,
    sgst: 0,
    cgst: 0,
    totalWithGst: 0,
    feesRemaining: 0,
  });
  const [installments, setInstallments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsRecalculation, setNeedsRecalculation] = useState(false);

  const getTodayISO = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const roundRupee = (value) => {
    const decimal = value - Math.floor(value);
    return decimal >= 0.39 ? Math.ceil(value) : Math.floor(value);
  };

  const formatINR = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return getTodayISO();
    // Handle ISO date strings (e.g., "2025-08-10T18:30:00.000Z") or "yyyy-MM-dd"
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Return "yyyy-MM-dd"
    }
    // If already in "yyyy-MM-dd" format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // Fallback to today's date if invalid
    return getTodayISO();
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/courses`);
        let data = Array.isArray(res.data?.data)
          ? res.data.data
          : res.data || [];
        setCourses(data);
        localStorage.setItem('courses', JSON.stringify(data));
      } catch (err) {
        console.error('Error fetching courses', err);
        const stored = localStorage.getItem('courses');
        if (stored) setCourses(JSON.parse(stored));
      }
    };

    const fetchAdmission = async () => {
      try {
        setIsLoading(true);
        setError('');
        const res = await axios.get(`${BASE_URL}/kaushal-kendra/${id}`);
        const data = res.data.data || res.data;
        if (!data) throw new Error('No admission data found');

        setForm({
          name: data.name || '',
          mobile: data.mobile || '',
          email: data.email || '',
          address: data.address || '',
          idType: data.idType || 'Aadhar',
          idNumber: data.idNumber || '',
          course: data.course || (courses.length ? courses[0].name : ''),
          discount: data.discount?.toString() || '0',
          courseFee: data.courseFee?.toString() || '0',
          amountPaid: data.amountPaid?.toString() || '0',
          handedTo: data.handedTo || 'Rohan',
          remarks: data.remarks || '',
          date: parseDate(data.date),
          paymentMode: data.paymentMode || 'Cash',
          utrNumber: data.utrNumber || '',
          chequeNumber: data.chequeNumber || '',
          bankName: data.bankName || '',
          upiPaidTo: data.upiPaidTo || '',
          duration: data.duration?.toString() || '',
          durationUnit: data.durationUnit || 'months',
          registrationPaid: Boolean(data.registrationPaid),
        });

        setInstallments(
          Array.isArray(data.installments)
            ? data.installments.map((inst) => ({
                date: parseDate(inst.date),
                amount: inst.amount?.toString() || '',
              }))
            : []
        );

        setNeedsRecalculation(true);
      } catch (err) {
        console.error('Error fetching admission:', err);
        setError(
          err.response?.data?.message || 'Failed to load admission data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
    fetchAdmission();
  }, [id, courses.length]);

  useEffect(() => {
    if (!needsRecalculation) return;

    const selectedCourse = courses.find((c) => c.name === form.course);
    const courseFee = selectedCourse ? parseFloat(selectedCourse.fee) : 0;
    const discountPercent = parseFloat(form.discount) || 0;
    const discountAmount = (courseFee * discountPercent) / 100;
    const netAmount = courseFee - discountAmount;
    const sgst = netAmount * 0.09;
    const cgst = netAmount * 0.09;
    const totalWithGst = roundRupee(netAmount + sgst + cgst);

    const paid = installments.reduce(
      (sum, inst) => sum + (parseFloat(inst.amount) || 0),
      0
    );
    const feesRemaining = Math.max(0, totalWithGst - paid);

    setForm((p) => ({
      ...p,
      courseFee: courseFee.toFixed(2),
      amountPaid: paid.toFixed(2),
    }));
    setCalcs({
      courseFee,
      discountAmount,
      netAmount,
      sgst,
      cgst,
      totalWithGst,
      feesRemaining,
    });
    setNeedsRecalculation(false);
  }, [form.course, form.discount, installments, courses, needsRecalculation]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'name') value = value.replace(/[^a-zA-Z\s]/g, '');
    if (name === 'mobile') value = value.replace(/[^0-9]/g, '').slice(0, 10);
    if (name === 'discount') {
      value = value.replace(/[^0-9.]/g, '');
      if (parseFloat(value) > 100) value = '100';
    }
    if (name === 'idNumber') value = value.replace(/[^0-9A-Za-z]/g, '');
    if (name === 'chequeNumber') value = value.replace(/[^0-9]/g, '');
    if (name === 'utrNumber') value = value.replace(/[^0-9A-Za-z]/g, '');
    if (name === 'duration') value = value.replace(/[^0-9]/g, '');
    setForm((p) => ({ ...p, [name]: value }));
    if (name === 'course' || name === 'discount') {
      setNeedsRecalculation(true);
    }
  };

  const addInstallment = () => {
    setInstallments((prev) => [...prev, { date: getTodayISO(), amount: '' }]);
    setNeedsRecalculation(true);
  };

  const updateInstallment = (index, field, value) => {
    const updated = [...installments];
    updated[index][field] = value;
    setInstallments(updated);
    if (field === 'amount') setNeedsRecalculation(true);
  };

  const handleInstallmentKeyPress = (e, index, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setNeedsRecalculation(true);
    }
  };

  const removeInstallment = (index) => {
    setInstallments((prev) => prev.filter((_, i) => i !== index));
    setNeedsRecalculation(true);
  };

  const getStatus = () => {
    if (calcs.totalWithGst === 0)
      return { text: 'Empty (Add amount)', color: 'gray' };
    if (calcs.feesRemaining === 0) return { text: 'Full Paid', color: 'green' };
    if (calcs.feesRemaining < calcs.totalWithGst)
      return { text: 'Partial Paid', color: 'orange' };
    return { text: 'Pending', color: 'red' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error('Enter a valid 10-digit Indian mobile number', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }
    if (
      form.paymentMode === 'PhonePe' &&
      (!form.utrNumber || !form.upiPaidTo)
    ) {
      toast.error(
        'UTR Number and UPI Paid To are required for PhonePe payments',
        {
          position: 'top-right',
          autoClose: 3000,
        }
      );
      return;
    }
    if (
      form.paymentMode === 'Cheque' &&
      (!form.chequeNumber || !form.bankName)
    ) {
      toast.error(
        'Cheque Number and Bank Name are required for Cheque payments',
        {
          position: 'top-right',
          autoClose: 3000,
        }
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCourse = courses.find((c) => c.name === form.course);
      const courseFee = selectedCourse ? parseFloat(selectedCourse.fee) : 0;
      const discountPercent = parseFloat(form.discount) || 0;
      const discountAmount = (courseFee * discountPercent) / 100;
      const paid = installments.reduce(
        (sum, inst) => sum + (parseFloat(inst.amount) || 0),
        0
      );

      const payload = {
        ...form,
        courseFee,
        discount: discountPercent,
        discountAmount,
        amountPaid: paid,
        registrationPaid: paid > 0,
        installments: installments.map((inst) => ({
          date: inst.date, // Already in yyyy-MM-dd format
          amount: parseFloat(inst.amount) || 0,
        })),
      };

      const res = await axios.patch(
        `${BASE_URL}/kaushal-kendra/${id}`,
        payload
      );
      if (res.data.success) {
        toast.success('✅ Update Successful!', {
          position: 'top-right',
          autoClose: 2000,
        });
        timerRef.current = setTimeout(() => {
          setIsSubmitting(false);
          navigate('/kaushal-kendra-list');
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating admission:', err);
      setIsSubmitting(false);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to update registration. Please try again.';
      toast.error(`❌ ${errorMessage}`, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const status = getStatus();

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh', background: '#f8f9fa' }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: '3rem', height: '3rem' }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading admission data...</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh', background: '#f8f9fa' }}
      >
        <div className="text-center">
          <div className="alert alert-danger mb-4">
            <FaExclamationTriangle className="me-2" />
            {error}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/kaushal-kendra-list')}
          >
            <FaArrowLeft className="me-2" />
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3" style={{ background: '#fff', color: '#000' }}>
      <ToastContainer />
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="text-center">
          <img
            src={kaushalKendraLogo}
            alt="Kaushal Kendra Logo"
            style={{ maxWidth: '200px' }}
            className="img-fluid"
          />
          <h4 className="fw-bold mt-2">Edit Kaushal Kendra Registration</h4>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary d-flex align-items-center"
            onClick={() => navigate('/kaushal-kendra-list')}
          >
            <FaArrowLeft className="me-1" />
            Back to List
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-2">
          <div className="col-12 col-md-3">
            <label>
              <FaCalendarAlt /> Date
            </label>
            <input
              type="date"
              name="date"
              className="form-control"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-3">
            <label>
              <FaUser /> Name
            </label>
            <input
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-3">
            <label>
              <FaPhone /> Mobile
            </label>
            <input
              name="mobile"
              className="form-control"
              value={form.mobile}
              onChange={handleChange}
              required
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="col-12 col-md-3">
            <label>
              <FaEnvelope /> Email (optional)
            </label>
            <input
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md-6">
            <label>
              <FaHome /> Address (optional)
            </label>
            <input
              name="address"
              className="form-control"
              value={form.address}
              title={form.address || ''}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md-3">
            <label>
              <FaIdCard /> ID Type
            </label>
            <select
              name="idType"
              className="form-select"
              value={form.idType}
              onChange={handleChange}
            >
              <option value="Aadhar">Aadhar</option>
              <option value="PAN">PAN</option>
              <option value="Passport">Passport</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label>
              <FaRegIdCard /> ID Number
            </label>
            <input
              name="idNumber"
              className="form-control"
              value={form.idNumber}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md-3">
            <label>
              <FaBook /> Course
            </label>
            <select
              name="course"
              className="form-select"
              value={form.course}
              onChange={(e) => {
                handleChange(e);
                setNeedsRecalculation(true);
              }}
              required
            >
              {courses.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name} ({formatINR(c.fee)})
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label>
              <FaPercent /> Discount (%)
            </label>
            <input
              name="discount"
              type="number"
              className="form-control"
              value={form.discount}
              onChange={(e) => {
                handleChange(e);
                setNeedsRecalculation(true);
              }}
              min="0"
              max="100"
              inputMode="numeric"
              step="any"
            />
          </div>
          <div className="col-6 col-md-3">
            <label>
              <FaFileInvoice /> Amount to Pay (Net Amount)
            </label>
            <input
              type="text"
              className="form-control"
              value={formatINR(calcs.netAmount)}
              readOnly
            />
          </div>
          <div className="col-12 col-md-3">
            <label>
              <FaMoneyBillWave /> Payment Mode
            </label>
            <select
              name="paymentMode"
              className="form-select"
              value={form.paymentMode}
              onChange={handleChange}
            >
              <option value="Cash">Cash</option>
              <option value="PhonePe">PhonePe</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        {form.paymentMode === 'PhonePe' && (
          <div className="row g-2 mt-2">
            <div className="col-12 col-md-4">
              <label>
                <FaMobileAlt /> UTR Number
              </label>
              <input
                name="utrNumber"
                className="form-control"
                value={form.utrNumber}
                onChange={handleChange}
                placeholder="Enter UTR Number"
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label>
                <FaUser /> UPI Paid To
              </label>
              <input
                name="upiPaidTo"
                className="form-control"
                value={form.upiPaidTo || ''}
                onChange={handleChange}
                placeholder="Enter UPI Paid To"
                required
              />
            </div>
          </div>
        )}

        {form.paymentMode === 'Cheque' && (
          <div className="row g-2 mt-2">
            <div className="col-12 col-md-4">
              <label>
                <FaFileAlt /> Cheque Number
              </label>
              <input
                name="chequeNumber"
                className="form-control"
                value={form.chequeNumber}
                onChange={handleChange}
                placeholder="Enter Cheque Number"
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label>
                <FaFileAlt /> Bank Name
              </label>
              <input
                name="bankName"
                className="form-control"
                value={form.bankName}
                onChange={handleChange}
                placeholder="Enter Bank Name"
                required
              />
            </div>
          </div>
        )}

        <div className="row g-2 mt-2">
          <div className="col-12 col-md-3">
            <label>
              <FaClock /> Duration (optional)
            </label>
            <div className="input-group">
              <input
                name="duration"
                type="number"
                className="form-control"
                style={{ width: '70px' }}
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 6"
                min="0"
                inputMode="numeric"
              />
              <select
                name="durationUnit"
                className="form-select"
                style={{ width: '100px' }}
                value={form.durationUnit}
                onChange={handleChange}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <label>
              <FaUser /> Handed Over To
            </label>
            <select
              name="handedTo"
              className="form-select"
              value={form.handedTo}
              onChange={handleChange}
            >
              <option value="Rohan">Rohan</option>
              <option value="Gururaj">Gururaj</option>
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label>
              <FaFileAlt /> Remarks
            </label>
            <input
              name="remarks"
              className="form-control"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Any additional notes"
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0">Installments</h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={addInstallment}
            >
              <FaPlus /> Add Installment
            </button>
          </div>

          {installments.length > 0 && (
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th width="40%">Date</th>
                    <th width="40%">Amount</th>
                    <th width="20%">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((inst, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={inst.date}
                          onChange={(e) =>
                            updateInstallment(i, 'date', e.target.value)
                          }
                          onKeyPress={(e) =>
                            handleInstallmentKeyPress(e, i, 'date')
                          }
                          max={getTodayISO()}
                        />
                      </td>
                      <td>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Amount"
                            value={inst.amount}
                            onChange={(e) =>
                              updateInstallment(i, 'amount', e.target.value)
                            }
                            onKeyPress={(e) =>
                              handleInstallmentKeyPress(e, i, 'amount')
                            }
                            inputMode="numeric"
                            step="any"
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeInstallment(i)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-3">
          <h6 className="fw-bold">Calculation Summary</h6>
          <div className="table-responsive">
            <table
              className="table table-bordered table-striped table-sm mb-0"
              style={{ fontSize: '0.85rem' }}
            >
              <thead className="table-dark">
                <tr>
                  <th>Item</th>
                  <th>Formula</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Course Fee</td>
                  <td>As per selected course</td>
                  <td>{formatINR(calcs.courseFee)}</td>
                </tr>
                {form.discount > 0 && (
                  <tr>
                    <td>Discount</td>
                    <td>{form.discount}% of Course Fee</td>
                    <td>- {formatINR(calcs.discountAmount)}</td>
                  </tr>
                )}
                <tr>
                  <td>Net Amount (Amount to Pay)</td>
                  <td>Course Fee - Discount</td>
                  <td>{formatINR(calcs.netAmount)}</td>
                </tr>
                <tr>
                  <td>SGST (9%)</td>
                  <td>Net Amount × 9%</td>
                  <td>{formatINR(calcs.sgst)}</td>
                </tr>
                <tr>
                  <td>CGST (9%)</td>
                  <td>Net Amount × 9%</td>
                  <td>{formatINR(calcs.cgst)}</td>
                </tr>
                <tr className="table-primary">
                  <td>
                    <b>Grand Total with GST (18%)</b>
                  </td>
                  <td>Net + SGST + CGST</td>
                  <td>
                    <b>{formatINR(calcs.totalWithGst)}</b>
                  </td>
                </tr>
                <tr>
                  <td>Fees Paid</td>
                  <td>Sum of installments (press Enter after typing amount)</td>
                  <td>{formatINR(form.amountPaid)}</td>
                </tr>
                <tr
                  className={
                    calcs.feesRemaining === 0
                      ? 'table-success'
                      : calcs.totalWithGst === 0
                      ? 'table-secondary'
                      : 'table-warning'
                  }
                >
                  <td>
                    <b>Fees Remaining</b>
                  </td>
                  <td>Grand Total - Paid</td>
                  <td>
                    <b>{formatINR(calcs.feesRemaining)}</b>
                  </td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td colSpan={2}>
                    <span style={{ color: status.color }}>●</span> {status.text}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 d-flex flex-wrap gap-2">
          <button
            type="submit"
            className="btn btn-success px-4 d-flex align-items-center justify-content-center"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            {isSubmitting ? 'Updating...' : 'Update'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/kaushal-kendra-list')}
            className="btn btn-primary px-4 d-flex align-items-center justify-content-center"
            style={{
              background: 'linear-gradient(90deg, #4b6cb7, #182848)',
              border: 'none',
              fontWeight: 500,
            }}
          >
            <FaFileInvoice className="me-1" />
            Kaushal Kendra List
          </button>
        </div>
      </form>
    </div>
  );
}
