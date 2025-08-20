import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  FaArrowLeft,
  FaBook,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
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
  FaPlusCircle,
  FaPrint,
  FaRegIdCard,
  FaTrash,
  FaUser,
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import vizionexlLogo from '../assets/vizionexlLogo.png';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function VizionexlForm() {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    idType: 'Aadhar',
    idNumber: '',
    course: '',
    discount: '',
    feesPaid: '',
    handedTo: 'Rohan',
    remarks: '',
    date: '',
    paymentMode: 'Cash',
    upiTransactionId: '',
    upiPaidTo: 'Rohan',
    chequeNumber: '',
    bankName: '',
    duration: '',
    durationUnit: 'months',
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
  const [tempInstallments, setTempInstallments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsRecalculation, setNeedsRecalculation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();

  const getTodayISO = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const roundRupee = (value) => Math.round(parseFloat(value) || 0);

  const formatINR = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f8f9fa !important; }
      }
    `,
  });

  useEffect(() => {
    const now = new Date();
    const istDate = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    );
    const day = String(istDate.getDate()).padStart(2, '0');
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const year = istDate.getFullYear();
    setForm((p) => ({ ...p, date: `${day}/${month}/${year}` }));
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/courses`);
        let data = Array.isArray(res.data?.data)
          ? res.data.data
          : res.data || [];
        setCourses(data);
        localStorage.setItem('courses', JSON.stringify(data));
        if (data.length && !form.course) {
          setForm((p) => ({ ...p, course: data[0].name }));
          setNeedsRecalculation(true);
        }
      } catch (err) {
        console.error('Error fetching courses', err);
        const stored = localStorage.getItem('courses');
        if (stored) setCourses(JSON.parse(stored));
      }
    };
    fetchCourses();
  }, [location.key]);

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

    setForm((p) => ({ ...p, feesPaid: feesPaid.toString() }));
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
    if (name === 'upiTransactionId') value = value.replace(/[^0-9A-Za-z]/g, '');
    if (name === 'duration') value = value.replace(/[^0-9]/g, '');
    setForm((p) => ({ ...p, [name]: value }));
    if (name === 'course' || name === 'discount') {
      setNeedsRecalculation(true);
    }
  };

  const addInstallment = () => {
    setInstallments((prev) => [...prev, { date: getTodayISO(), amount: '' }]);
    setTempInstallments((prev) => [
      ...prev,
      { date: getTodayISO(), amount: '' },
    ]);
    setNeedsRecalculation(true);
  };

  const updateInstallment = (index, field, value) => {
    if (field === 'amount') {
      value = value.replace(/[^0-9.]/g, '');
    }
    const updated = [...tempInstallments];
    updated[index] = { ...updated[index], [field]: value };
    setTempInstallments(updated);
  };

  const handleInstallmentKeyPress = (e, index, field) => {
    if (field !== 'amount') {
      if (e.key === 'Enter') {
        e.preventDefault();
        setInstallments((prev) =>
          prev.map((inst, i) =>
            i === index
              ? { ...inst, [field]: tempInstallments[index][field] }
              : inst
          )
        );
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const tempAmount = parseFloat(tempInstallments[index].amount) || 0;
      const totalPaid = installments.reduce(
        (sum, inst, i) =>
          i === index ? sum + tempAmount : sum + (parseFloat(inst.amount) || 0),
        0
      );
      if (totalPaid > calcs.totalWithGst) {
        alert(
          `Total installments (₹${roundRupee(
            totalPaid
          )}) cannot exceed total payable (₹${calcs.totalWithGst})`
        );
        return;
      }
      setInstallments((prev) =>
        prev.map((inst, i) =>
          i === index
            ? { ...inst, amount: tempInstallments[index].amount }
            : inst
        )
      );
      setNeedsRecalculation(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTempInstallments((prev) =>
        prev.map((inst, i) =>
          i === index
            ? { ...inst, amount: installments[index]?.amount || '' }
            : inst
        )
      );
    }
    // Backspace is handled by default input behavior
  };

  const removeInstallment = (index) => {
    setInstallments((prev) => prev.filter((_, i) => i !== index));
    setTempInstallments((prev) => prev.filter((_, i) => i !== index));
    setNeedsRecalculation(true);
    if ((installments.length - 1) % rowsPerPage === 0) {
      setCurrentPage(Math.max(1, currentPage - 1));
    }
  };

  const getStatus = () => {
    const hasConfirmedAmount = installments.some(
      (inst) => parseFloat(inst.amount) > 0
    );
    if (!hasConfirmedAmount)
      return { text: 'Empty (Add amount)', color: 'gray' };
    if (calcs.feesRemaining === 0) return { text: 'Full Paid', color: 'green' };
    if (calcs.feesRemaining < calcs.totalWithGst)
      return { text: 'Partial Paid', color: 'orange' };
    return { text: 'Pending', color: 'red' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      alert('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (installments.length === 0 && parseFloat(form.feesPaid) > 0) {
      alert('Please add at least one installment for fees paid');
      return;
    }
    const calculatedFeesPaid = roundRupee(
      installments.reduce(
        (sum, inst) => sum + (parseFloat(inst.amount) || 0),
        0
      )
    );
    if (calculatedFeesPaid > calcs.totalWithGst) {
      alert(
        `Fees paid (₹${calculatedFeesPaid}) cannot exceed total payable amount (₹${calcs.totalWithGst})`
      );
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
        feesPaid: calculatedFeesPaid,
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
      };
      const res = await axios.post(`${BASE_URL}/vizionexl`, payload);
      if (res.data.success) {
        alert('Registration saved successfully!');
        setForm({
          name: '',
          mobile: '',
          email: '',
          address: '',
          idType: 'Aadhar',
          idNumber: '',
          course: courses.length ? courses[0].name : '',
          discount: '',
          feesPaid: '',
          handedTo: 'Rohan',
          remarks: '',
          date: form.date,
          paymentMode: 'Cash',
          upiTransactionId: '',
          upiPaidTo: 'Rohan',
          chequeNumber: '',
          bankName: '',
          duration: '',
          durationUnit: 'months',
        });
        setInstallments([]);
        setTempInstallments([]);
        setCurrentPage(1);
        navigate('/admission-list');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert(err.response?.data?.message || 'Error saving registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tempInstallments.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tempInstallments.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const status = getStatus();

  return (
    <div
      className="container-fluid p-3"
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .installment-table-container {
          max-height: 400px;
          overflow-y: auto;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
        }
        .print-table th, .print-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .print-table th {
          background-color: #f2f2f2;
        }
      `}</style>

      <div style={{ display: 'none' }}>
        <div ref={printRef} className="p-4">
          <div className="text-center mb-4">
            <h2>Vizionexl Technologies</h2>
            <h4>Registration Details</h4>
          </div>

          <table className="print-table mb-4">
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: '#f8f9fa' }}>
                  Student Information
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Name:</strong>
                </td>
                <td>{form.name}</td>
              </tr>
              <tr>
                <td>
                  <strong>Mobile:</strong>
                </td>
                <td>{form.mobile}</td>
              </tr>
              <tr>
                <td>
                  <strong>Course:</strong>
                </td>
                <td>{form.course}</td>
              </tr>
              <tr>
                <td>
                  <strong>Date:</strong>
                </td>
                <td>{form.date}</td>
              </tr>
            </tbody>
          </table>

          <table className="print-table mb-4">
            <thead>
              <tr>
                <th colSpan="2" style={{ backgroundColor: '#f8f9fa' }}>
                  Payment Details
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Course Fee:</strong>
                </td>
                <td>{formatINR(calcs.courseFee)}</td>
              </tr>
              {form.discount > 0 && (
                <tr>
                  <td>
                    <strong>Discount ({form.discount}%):</strong>
                  </td>
                  <td>- {formatINR(calcs.discountAmount)}</td>
                </tr>
              )}
              <tr>
                <td>
                  <strong>Net Amount:</strong>
                </td>
                <td>{formatINR(calcs.netAmount)}</td>
              </tr>
              <tr>
                <td>
                  <strong>SGST (9%):</strong>
                </td>
                <td>{formatINR(calcs.sgst)}</td>
              </tr>
              <tr>
                <td>
                  <strong>CGST (9%):</strong>
                </td>
                <td>{formatINR(calcs.cgst)}</td>
              </tr>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td>
                  <strong>Total with GST:</strong>
                </td>
                <td>{formatINR(calcs.totalWithGst)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Fees Paid:</strong>
                </td>
                <td>{formatINR(form.feesPaid)}</td>
              </tr>
              <tr
                style={{
                  backgroundColor:
                    calcs.feesRemaining === 0 ? '#e6ffed' : '#fff3cd',
                }}
              >
                <td>
                  <strong>Fees Remaining:</strong>
                </td>
                <td>{formatINR(calcs.feesRemaining)}</td>
              </tr>
            </tbody>
          </table>

          {installments.length > 0 && (
            <table className="print-table">
              <thead>
                <tr>
                  <th colSpan="2" style={{ backgroundColor: '#f8f9fa' }}>
                    Installments
                  </th>
                </tr>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((inst, i) => (
                  <tr key={i}>
                    <td>{inst.date}</td>
                    <td>{formatINR(inst.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="text-center">
          <img
            src={vizionexlLogo}
            alt="Vizionexl Logo"
            style={{ maxWidth: '200px' }}
            className="img-fluid"
          />
          <h4 className="fw-bold mt-2">Vizionexl Technologies Registration</h4>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-info d-flex align-items-center"
            onClick={() => navigate('/add-course')}
          >
            <FaPlusCircle className="me-1" />
            Add Course
          </button>
          <button
            type="button"
            className="btn btn-secondary d-flex align-items-center"
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft className="me-1" />
            Dashboard
          </button>
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center"
            onClick={handlePrint}
          >
            <FaPrint className="me-1" />
            Print
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
              className="btn btn-sm btn-outline-primary"
              onClick={addInstallment}
            >
              <FaPlus /> Add Installment
            </button>
          </div>

          {tempInstallments.length > 0 && (
            <div className="installment-table-container">
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
                    {currentRows.map((inst, i) => {
                      const globalIndex = indexOfFirstRow + i;
                      return (
                        <tr key={globalIndex}>
                          <td>
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={inst.date}
                              onChange={(e) =>
                                updateInstallment(
                                  globalIndex,
                                  'date',
                                  e.target.value
                                )
                              }
                              onKeyPress={(e) =>
                                handleInstallmentKeyPress(
                                  e,
                                  globalIndex,
                                  'date'
                                )
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
                                  updateInstallment(
                                    globalIndex,
                                    'amount',
                                    e.target.value
                                  )
                                }
                                onKeyPress={(e) =>
                                  handleInstallmentKeyPress(
                                    e,
                                    globalIndex,
                                    'amount'
                                  )
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
                              onClick={() => removeInstallment(globalIndex)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {tempInstallments.length > rowsPerPage && (
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div>
                    Showing {indexOfFirstRow + 1} to{' '}
                    {Math.min(indexOfLastRow, tempInstallments.length)} of{' '}
                    {tempInstallments.length} entries
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? 'disabled' : ''
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <FaChevronLeft size={12} />
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) => (
                          <li
                            key={number}
                            className={`page-item ${
                              currentPage === number ? 'active' : ''
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => paginate(number)}
                            >
                              {number}
                            </button>
                          </li>
                        )
                      )}
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? 'disabled' : ''
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <FaChevronRight size={12} />
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
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
                  <td>{formatINR(form.feesPaid)}</td>
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
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admission-list')}
            className="btn btn-primary px-4"
          >
            <FaFileInvoice /> Admission List
          </button>
        </div>
      </form>
    </div>
  );
}
