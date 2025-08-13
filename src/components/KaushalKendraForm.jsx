// src/components/KaushalKendraForm.jsx
import axios from 'axios';
import { useEffect, useRef, useState } from 'react'; // Add useRef
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import kaushalLogo from '../assets/kaushal-kendra-logo.jpg';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function KaushalKendraForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    idType: '',
    idNumber: '',
    course: '',
    registrationPaid: false,
    amountPaid: '',
    handedTo: '',
    feesRemaining: '',
  });

  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null); // Use useRef for timer

  const courses = ['Tally', 'Excel', 'Accounting Basics'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading) return; // Prevent multiple submissions
    setLoading(true);

    try {
      // Validate form inputs
      if (
        !form.name ||
        !form.mobile ||
        !form.idType ||
        !form.idNumber ||
        !form.course ||
        !form.handedTo
      ) {
        throw new Error('All fields are required');
      }

      const response = await axios.post(`${BASE_URL}/kaushal-kendra`, form);

      // Show success toast
      toast.success('✅ Registration Successful!', {
        position: 'top-right',
        autoClose: 2000,
      });

      // Reset form
      setForm({
        name: '',
        mobile: '',
        idType: '',
        idNumber: '',
        course: '',
        registrationPaid: false,
        amountPaid: '',
        handedTo: '',
        feesRemaining: '',
      });

      // Navigate after 2 seconds
      timerRef.current = setTimeout(() => {
        setLoading(false);
        navigate('/kaushal-kendra-list');
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false);
      // Show specific error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit registration. Please try again.';
      toast.error(`❌ ${errorMessage}`, {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Fees calculation
  const baseFee = 900;
  const cgst = (baseFee * 0.09).toFixed(2);
  const sgst = (baseFee * 0.09).toFixed(2);
  const total = (baseFee + parseFloat(cgst) + parseFloat(sgst)).toFixed(2);

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="text-center mb-4">
        <img
          src={kaushalLogo}
          alt="Kaushal Kendra Logo"
          style={{ height: 60 }}
        />
        <h4 className="mt-2 fw-bold">Kaushal Kendra Registration</h4>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded bg-light shadow"
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Mobile Number</label>
            <input
              name="mobile"
              className="form-control"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">ID Proof Type</label>
            <input
              name="idType"
              className="form-control"
              value={form.idType}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">ID Proof Number</label>
            <input
              name="idNumber"
              className="form-control"
              value={form.idNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Course</label>
            <select
              name="course"
              className="form-select"
              value={form.course}
              onChange={handleChange}
              required
            >
              <option value="">Select a course</option>
              {courses.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Registration Fee Paid</label>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="registrationPaid"
                name="registrationPaid"
                checked={form.registrationPaid}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="registrationPaid">
                Yes
              </label>
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Amount Paid</label>
            <input
              name="amountPaid"
              className="form-control"
              value={form.amountPaid}
              onChange={handleChange}
              type="number"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Fees Remaining</label>
            <input
              name="feesRemaining"
              className="form-control"
              value={form.feesRemaining}
              onChange={handleChange}
              type="number"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Handed Over To</label>
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

        <div className="mt-4">
          <p>
            <strong>Base Fee:</strong> ₹{baseFee}
          </p>
          <p>
            <strong>CGST (9%):</strong> ₹{cgst}
          </p>
          <p>
            <strong>SGST (9%):</strong> ₹{sgst}
          </p>
          <p>
            <strong>Total (with GST):</strong> ₹{total}
          </p>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button
            className="btn btn-success flex-grow-1 d-flex align-items-center justify-content-center"
            type="submit"
            disabled={loading}
          >
            {loading && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            {loading ? 'Registering...' : 'Register'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/kaushal-kendra-list')}
            className="btn btn-primary flex-grow-1 d-flex justify-content-center align-items-center"
            style={{
              background: 'linear-gradient(90deg, #4b6cb7, #182848)',
              border: 'none',
              fontWeight: 500,
            }}
          >
            📋 Kaushal Kendra List
          </button>
        </div>
      </form>
    </div>
  );
}
