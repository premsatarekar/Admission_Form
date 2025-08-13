import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaBook,
  FaClock,
  FaFileAlt,
  FaIdCard,
  FaPhone,
  FaPlus,
  FaRegIdCard,
  FaTrash,
  FaUser,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import kaushalLogo from '../assets/kaushal-kendra-logo.jpg';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function KaushalKendraEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const companyName = 'Kaushal Kendra';
  const companyAddress =
    '1st Floor, I C Nagathan Building, Opp Hunamshetti Tyres, Gurukul Road, Vijayapura';

  const baseFee = 900;
  const cgst = (baseFee * 0.09).toFixed(2);
  const sgst = (baseFee * 0.09).toFixed(2);
  const total = (baseFee + parseFloat(cgst) + parseFloat(sgst)).toFixed(2);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    idType: 'Aadhar',
    idNumber: '',
    course: '',
    handedTo: '',
    duration: '',
    durationUnit: 'months',
  });
  const [installments, setInstallments] = useState([]);
  const [calcs, setCalcs] = useState({
    amountPaid: 0,
    feesRemaining: total,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsRecalculation, setNeedsRecalculation] = useState(false);

  const courses = ['Tally', 'Excel', 'Accounting Basics'];

  const getTodayISO = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${BASE_URL}/kaushal-kendra/${id}`);
        const data = res.data;
        setForm({
          name: data.name || '',
          mobile: data.mobile || '',
          idType: data.idType || 'Aadhar',
          idNumber: data.idNumber || '',
          course: data.course || '',
          handedTo: data.handedTo || '',
          duration: data.duration ? data.duration.toString() : '',
          durationUnit: data.durationUnit || 'months',
        });
        setInstallments(data.installments || []);
        setNeedsRecalculation(true);
      } catch (error) {
        console.error('Error fetching registration:', error);
        setError(
          error.response?.data?.message || 'Failed to load registration data'
        );
        toast.error('Failed to load registration data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRegistration();
    }
  }, [id]);

  useEffect(() => {
    if (!needsRecalculation) return;

    const amountPaid = installments.reduce(
      (sum, inst) => sum + (parseFloat(inst.amount) || 0),
      0
    );
    const feesRemaining = Math.max(0, parseFloat(total) - amountPaid);

    setCalcs({
      amountPaid,
      feesRemaining,
    });
    setNeedsRecalculation(false);
  }, [installments, needsRecalculation]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'name') value = value.replace(/[^a-zA-Z\s]/g, '');
    if (name === 'mobile') value = value.replace(/[^0-9]/g, '').slice(0, 10);
    if (name === 'idNumber') value = value.replace(/[^0-9A-Za-z]/g, '');
    if (name === 'duration') value = value.replace(/[^0-9]/g, '');
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addInstallment = () => {
    setInstallments((prev) => [...prev, { date: getTodayISO(), amount: '' }]);
  };

  const updateInstallment = (index, field, value) => {
    const updated = [...installments];
    updated[index][field] = value;
    setInstallments(updated);
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
    if (calcs.feesRemaining === 0) return { text: 'Full Paid', color: 'green' };
    if (calcs.amountPaid > 0) return { text: 'Partial Paid', color: 'orange' };
    return { text: 'Pending', color: 'red' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      toast.error('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!courses.includes(form.course)) {
      toast.error('Please select a valid course');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        amountPaid: calcs.amountPaid,
        feesRemaining: calcs.feesRemaining,
        installments: installments.map((inst) => ({
          ...inst,
          amount: parseFloat(inst.amount) || 0,
        })),
      };
      await axios.put(`${BASE_URL}/kaushal-kendra/${id}`, payload);
      toast.success('Registration updated successfully!');
      navigate('/kaushal-kendra-list');
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update registration'
      );
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
          <h5 className="text-muted">Loading registration data...</h5>
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
            onClick={() => navigate('/kaushal-kendra-list')}
          >
            <FaArrowLeft className="me-2" />
            Back to Registration List
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
            src={kaushalLogo}
            alt="Kaushal Kendra Logo"
            style={{ maxWidth: '200px' }}
            className="img-fluid"
          />
          <h4 className="fw-bold mt-2">Edit {companyName} Registration</h4>
          <p className="text-muted mb-0">{companyAddress}</p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary d-flex align-items-center"
            onClick={() => navigate('/kaushal-kendra-list')}
          >
            <FaArrowLeft className="me-1" />
            Back to Registration List
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-2">
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
              required
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
              <option value="">Select a course</option>
              {courses.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
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
              required
            >
              <option value="">Select</option>
              <option value="Rohan">Rohan</option>
              <option value="Gururaj">Gururaj</option>
            </select>
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
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Base Fee</td>
                  <td>{formatINR(baseFee)}</td>
                </tr>
                <tr>
                  <td>CGST (9%)</td>
                  <td>{formatINR(cgst)}</td>
                </tr>
                <tr>
                  <td>SGST (9%)</td>
                  <td>{formatINR(sgst)}</td>
                </tr>
                <tr className="table-primary">
                  <td>
                    <b>Total (with GST)</b>
                  </td>
                  <td>
                    <b>{formatINR(total)}</b>
                  </td>
                </tr>
                <tr>
                  <td>Fees Paid</td>
                  <td>{formatINR(calcs.amountPaid)}</td>
                </tr>
                <tr
                  className={
                    calcs.feesRemaining === 0
                      ? 'table-success'
                      : calcs.amountPaid === 0
                      ? 'table-warning'
                      : 'table-warning'
                  }
                >
                  <td>
                    <b>Fees Remaining</b>
                  </td>
                  <td>
                    <b>{formatINR(calcs.feesRemaining)}</b>
                  </td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>
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
            onClick={() => navigate('/kaushal-kendra-list')}
            className="btn btn-secondary px-4"
          >
            <FaArrowLeft /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
