import axios from 'axios';
import { useEffect, useState } from 'react';
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
    idType: '',
    idNumber: '',
    course: '',
    registrationPaid: false,
    amountPaid: '',
    handedTo: '',
    feesRemaining: '',
  });

  const courses = ['Tally', 'Excel', 'Accounting Basics'];

  // Fetch existing registration data
  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/kaushal-kendra/${id}`);
        const data = res.data;

        setForm({
          name: data.name || '',
          mobile: data.mobile || '',
          idType: data.idType || '',
          idNumber: data.idNumber || '',
          course: data.course || '',
          registrationPaid: data.registrationPaid || false,
          amountPaid: data.amountPaid || '',
          handedTo: data.handedTo || '',
          feesRemaining: data.feesRemaining || '',
        });
      } catch (error) {
        console.error('Error fetching registration:', error);
        toast.error('Failed to load registration data');
        navigate('/kaushal-kendra-list');
      }
    };

    if (id) {
      fetchRegistration();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/kaushal-kendra/${id}`, form);
      toast.success('Registration updated successfully!');
      navigate('/kaushal-kendra-list');
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('Failed to update registration');
    }
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <img
          src={kaushalLogo}
          alt="Kaushal Kendra Logo"
          style={{ height: '60px' }}
        />
        <h4 className="mt-2 fw-bold">Edit Kaushal Kendra Registration</h4>
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
              {courses.map((course, index) => (
                <option key={index} value={course}>
                  {course}
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
          <button className="btn btn-primary flex-grow-1" type="submit">
            Update Registration
          </button>
          <button
            type="button"
            onClick={() => navigate('/kaushal-kendra-list')}
            className="btn btn-secondary flex-grow-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
