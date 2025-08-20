import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaBook,
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaFileAlt,
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
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import vizionexlLogo from '../assets/vizionexlLogo.png';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function VizionexlFormEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date: '',
    name: '',
    mobile: '',
    email: '',
    address: '',
    idType: 'Aadhar',
    idNumber: '',
    course: '',
    discount: '',
    handedTo: 'Rohan',
    remarks: '',
    paymentMode: 'Cash',
    upiTransactionId: '',
    upiPaidTo: 'Rohan',
    chequeNumber: '',
    bankName: '',
    duration: '',
    durationUnit: 'months',
  });
  const [courses, setCourses] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [calcs, setCalcs] = useState({
    courseFee: 0,
    discountAmount: 0,
    netAmount: 0,
    sgst: 0,
    cgst: 0,
    totalWithGst: 0,
    feesPaid: 0,
    feesRemaining: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsRecalculation, setNeedsRecalculation] = useState(false);

  const getTodayISO = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const roundRupee = (value) => Math.round(parseFloat(value) || 0);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [coursesRes, admissionRes] = await Promise.all([
          axios.get(`${BASE_URL}/courses`),
          axios.get(`${BASE_URL}/vizionexl/${id}`),
        ]);

        const coursesData = Array.isArray(coursesRes.data?.data)
          ? coursesRes.data.data
          : coursesRes.data || [];
        const admission = admissionRes.data.data || admissionRes.data || {};

        setCourses(coursesData);
        localStorage.setItem('courses', JSON.stringify(coursesData));

        const now = new Date();
        const istDate = new Date(
          now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        );
        const day = String(istDate.getDate()).padStart(2, '0');
        const month = String(istDate.getMonth() + 1).padStart(2, '0');
        const year = istDate.getFullYear();

        setForm({
          date: admission.date || `${day}/${month}/${year}`,
          name: admission.name || '',
          mobile: admission.mobile || '',
          email: admission.email || '',
          address: admission.address || '',
          idType: admission.idType || 'Aadhar',
          idNumber: admission.idNumber || '',
          course: admission.course || coursesData[0]?.name || '',
          discount: admission.discount ? String(admission.discount) : '',
          handedTo: admission.handedTo || 'Rohan',
          remarks: admission.remarks || '',
          paymentMode: admission.paymentMode || 'Cash',
          upiTransactionId: admission.upiTransactionId || '',
          upiPaidTo: admission.upiPaidTo || 'Rohan',
          chequeNumber: admission.chequeNumber || '',
          bankName: admission.bankName || '',
          duration: admission.duration ? String(admission.duration) : '',
          durationUnit: admission.durationUnit || 'months',
        });
        setInstallments(admission.installments || []);
        setNeedsRecalculation(true);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          err.response?.data?.message || 'Failed to load admission data'
        );
        toast.error('Failed to load admission data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!needsRecalculation) return;

    const selectedCourse = courses.find((c) => c.name === form.course);
    const courseFee = selectedCourse ? roundRupee(selectedCourse.fee) : 0;
    const discountPercent = parseFloat(form.discount) || 0;
    const discountAmount = roundRupee((courseFee * discountPercent) / 100);
    const netAmount = roundRupee(courseFee - discountAmount);
    const sgst = roundRupee(netAmount * 0.09);
    const cgst = roundRupee(netAmount * 0.09);
    const totalWithGst = roundRupee(netAmount + sgst + cgst);
    const feesPaid = roundRupee(
      installments.reduce(
        (sum, inst) => sum + (parseFloat(inst.amount) || 0),
        0
      )
    );
    const feesRemaining = Math.max(0, totalWithGst - feesPaid);

    setCalcs({
      courseFee,
      discountAmount,
      netAmount,
      sgst,
      cgst,
      totalWithGst,
      feesPaid,
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
    if (name === 'upiTransactionId') value = value.replace(/[^0-9A-Za-z]/g, '');
    if (name === 'duration') value = value.replace(/[^0-9]/g, '');
    setForm((p) => ({ ...p, [name]: value }));
    if (name === 'course' || name === 'discount') setNeedsRecalculation(true);
  };

  const addInstallment = () => {
    setInstallments((prev) => [...prev, { date: getTodayISO(), amount: '' }]);
    setNeedsRecalculation(true);
  };

  const updateInstallment = (index, field, value) => {
    if (field === 'amount') {
      value = value.replace(/[^0-9.]/g, '');
      const totalPaid = installments.reduce(
        (sum, inst, i) =>
          i === index
            ? sum + (parseFloat(value) || 0)
            : sum + (parseFloat(inst.amount) || 0),
        0
      );
      if (roundRupee(totalPaid) > roundRupee(calcs.totalWithGst)) {
        toast.error(
          `Total installments (₹${roundRupee(
            totalPaid
          )}) cannot exceed total payable (₹${roundRupee(calcs.totalWithGst)})`
        );
        return;
      }
    }
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
      toast.error('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!courses.find((c) => c.name === form.course)) {
      toast.error('Please select a valid course');
      return;
    }
    if (form.paymentMode === 'PhonePe' && !form.upiTransactionId) {
      toast.error('Please enter a UPI Transaction ID');
      return;
    }
    if (
      form.paymentMode === 'Cheque' &&
      (!form.chequeNumber || !form.bankName)
    ) {
      toast.error('Please enter Cheque Number and Bank Name');
      return;
    }
    const calculatedFeesPaid = roundRupee(
      installments.reduce(
        (sum, inst) => sum + (parseFloat(inst.amount) || 0),
        0
      )
    );
    if (calculatedFeesPaid > calcs.totalWithGst) {
      toast.error(
        `Fees paid (₹${calculatedFeesPaid}) cannot exceed total payable amount (₹${calcs.totalWithGst})`
      );
      return;
    }
    if (installments.length === 0 && calculatedFeesPaid > 0) {
      toast.error('Please add at least one installment for fees paid');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        idType: form.idType,
        idNumber: form.idNumber,
        course: form.course,
        date: form.date,
        discount: parseFloat(form.discount) || 0,
        handedTo: form.handedTo,
        remarks: form.remarks,
        paymentMode: form.paymentMode,
        upiTransactionId:
          form.paymentMode === 'PhonePe' ? form.upiTransactionId : '',
        upiPaidTo: form.paymentMode === 'PhonePe' ? form.upiPaidTo : '',
        chequeNumber: form.paymentMode === 'Cheque' ? form.chequeNumber : '',
        bankName: form.paymentMode === 'Cheque' ? form.bankName : '',
        duration: form.duration,
        durationUnit: form.durationUnit,
        installments: installments.map((inst) => ({
          date: inst.date,
          amount: roundRupee(inst.amount),
        })),
        feesPaid: calculatedFeesPaid,
      };
      console.log('Submitting payload:', JSON.stringify(payload, null, 2));
      const response = await axios.put(`${BASE_URL}/vizionexl/${id}`, payload);
      console.log('Update response:', response.data);
      toast.success('Admission updated successfully!');
      navigate('/admission-list');
    } catch (err) {
      console.error('Error updating admission:', err);
      const errorMessage =
        err.response?.data?.message || 'Failed to update admission';
      if (err.response?.data?.errors?.length) {
        const validationErrors = err.response.data.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('; ');
        toast.error(`Validation failed: ${validationErrors}`);
      } else {
        toast.error(errorMessage);
      }
      console.error('Backend error details:', err.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = getStatus();

  if (loading) {
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
            <FaFileAlt className="me-2" />
            {error}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admission-list')}
          >
            <FaArrowLeft className="me-2" />
            Back to Admission List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3" style={{ background: '#fff', color: '#000' }}>
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="text-center">
          <img
            src={vizionexlLogo}
            alt="Vizionexl Logo"
            style={{ maxWidth: '200px' }}
            className="img-fluid"
          />
          <h4 className="fw-bold mt-2">
            Edit Vizionexl Technologies Registration
          </h4>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary d-flex align-items-center"
            onClick={() => navigate('/admission-list')}
          >
            <FaArrowLeft className="me-1" />
            Back to Admission List
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-2">
          <div className="col-12 col-md-3">
            <label>
              <FaCalendarAlt /> Date
            </label>
            <input className="form-control" value={form.date} readOnly />
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
              onChange={handleChange}
              title={form.address || ''}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
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
              required
            >
              <option value="Aadhar">Aadhar</option>
              <option value="PAN">PAN</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
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
              onChange={handleChange}
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
              onChange={handleChange}
              min="0"
              max="100"
              inputMode="numeric"
              step="any"
            />
          </div>
          <div className="col-6 col-md-3">
            <label>
              <FaFileAlt /> Amount to Pay (Net Amount)
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
                <FaMobileAlt /> UPI Transaction ID
              </label>
              <input
                name="upiTransactionId"
                className="form-control"
                value={form.upiTransactionId}
                onChange={handleChange}
                placeholder="Enter UPI Transaction ID"
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <label>
                <FaUser /> Paid To
              </label>
              <select
                name="upiPaidTo"
                className="form-select"
                value={form.upiPaidTo}
                onChange={handleChange}
              >
                <option value="Rohan">Rohan</option>
                <option value="Gururaj">Gururaj</option>
              </select>
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
              className="btn btn-sm btn-primary"
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
                          className="btn btn-sm btn-danger"
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
                  <td>{formatINR(calcs.feesPaid)}</td>
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
            className="btn btn-success px-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admission-list')}
            className="btn btn-secondary px-4"
          >
            <FaArrowLeft /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
