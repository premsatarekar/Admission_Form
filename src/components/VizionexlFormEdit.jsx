// src/components/VizionexlFormEdit.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function VizionexlFormEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: '',
    name: '',
    mobile: '',
    idNumber: '',
    idType: 'Aadhar',
    course: '',
    feesPaid: '',
    handedTo: 'Rohan',
    discount: '',
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // set today's date (IST) if record doesn't have date
  useEffect(() => {
    const now = new Date();
    const ist = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    );
    const dd = String(ist.getDate()).padStart(2, '0');
    const mm = String(ist.getMonth() + 1).padStart(2, '0');
    const yyyy = ist.getFullYear();
    setFormData((p) => ({ ...p, date: p.date || `${dd}/${mm}/${yyyy}` }));
  }, []);

  // fetch courses + admission
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        const [coursesRes, admissionRes] = await Promise.all([
          axios.get(`${BASE_URL}/courses`),
          axios.get(`${BASE_URL}/vizionexl/${id}`),
        ]);

        const coursesData = Array.isArray(coursesRes.data?.data)
          ? coursesRes.data.data
          : coursesRes.data || [];
        const admission = admissionRes.data || admissionRes.data?.data || {};

        if (!mounted) return;
        setCourses(coursesData);

        // Normalize admission to expected keys
        setFormData({
          date: admission.date || formData.date || '',
          name: admission.name || '',
          mobile: admission.mobile || '',
          idNumber: admission.idNumber || '',
          idType: admission.idType || 'Aadhar',
          course: admission.course || coursesData[0]?.name || '',
          feesPaid:
            admission.feesPaid != null ? String(admission.feesPaid) : '',
          handedTo: admission.handedTo || 'Rohan',
          discount:
            admission.discount != null ? String(admission.discount) : '',
        });
      } catch (err) {
        console.error('Fetch error', err);
        if (mounted) setError('Failed to load data. Try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // calculations (like VizionexlForm)
  useEffect(() => {
    const selected = courses.find((c) => c.name === formData.course);
    const courseFee = selected ? parseFloat(selected.fee) : 0;
    const discountPercent = parseFloat(formData.discount) || 0;
    const discountAmount = (courseFee * discountPercent) / 100;
    const netAmount = courseFee - discountAmount;
    const sgst = netAmount * 0.09;
    const cgst = netAmount * 0.09;
    const totalWithGst = netAmount + sgst + cgst;
    const paid = parseFloat(formData.feesPaid) || 0;
    const feesRemaining = Math.max(0, totalWithGst - paid);

    setCalcs({
      courseFee,
      discountAmount,
      netAmount,
      sgst,
      cgst,
      totalWithGst,
      feesRemaining: Number(feesRemaining.toFixed(2)),
    });
  }, [formData.course, formData.discount, formData.feesPaid, courses]);

  // input sanitizers (same rules as create form)
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }
    if (name === 'mobile') {
      value = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    if (name === 'idNumber') {
      value = value.replace(/[^0-9]/g, '').slice(0, 12);
    }
    if (name === 'discount') {
      value = value.replace(/[^0-9.]/g, '');
      if (parseFloat(value) > 100) value = '100';
    }
    if (name === 'feesPaid') {
      // allow numeric with decimal
      value = value === '' ? '' : String(parseFloat(value));
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  // submit updated admission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // basic validations
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (formData.idType === 'Aadhar' && !/^\d{12}$/.test(formData.idNumber)) {
      setError('Enter a valid 12-digit Aadhaar number.');
      return;
    }

    // compute payload including calculated fields
    const payload = {
      date: formData.date,
      name: formData.name,
      mobile: formData.mobile,
      idNumber: formData.idNumber,
      idType: formData.idType,
      course: formData.course,
      feesPaid: parseFloat(formData.feesPaid) || 0,
      handedTo: formData.handedTo,
      discount: parseFloat(formData.discount) || 0,
      courseFee: calcs.courseFee,
      discountAmount: Number(calcs.discountAmount.toFixed(2)),
      netAmount: Number(calcs.netAmount.toFixed(2)),
      sgst: Number(calcs.sgst.toFixed(2)),
      cgst: Number(calcs.cgst.toFixed(2)),
      totalWithGst: Number(calcs.totalWithGst.toFixed(2)),
      feesRemaining: Number(calcs.feesRemaining),
    };

    setSaving(true);
    try {
      await axios.put(`${BASE_URL}/vizionexl/${id}`, payload);
      alert('Admission updated successfully!');
      navigate('/admission-list'); // adjust if your list route differs
    } catch (err) {
      console.error('Update error', err);
      setError(err.response?.data?.message || 'Failed to update admission.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p>Loading admission data...</p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">✏️ Edit Admission</h2>
        <button
          className="btn btn-secondary d-flex align-items-center gap-2"
          onClick={() => navigate('/admission-list')}
        >
          <FaArrowLeft /> Back to List
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input
                  type="text"
                  className="form-control"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Mobile</label>
                <input
                  type="tel"
                  className="form-control"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">ID Proof Type</label>
                <select
                  className="form-select"
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                  required
                >
                  <option value="Aadhar">Aadhar</option>
                  <option value="PAN">PAN</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>

              <div className="col-md-8">
                <label className="form-label">ID Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Course</label>
                <select
                  className="form-select"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                >
                  {courses.map((c, idx) => (
                    <option key={idx} value={c.name}>
                      {c.name} (₹{c.fee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Discount (%)</label>
                <input
                  type="number"
                  className="form-control"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Fees Paid (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  name="feesPaid"
                  value={formData.feesPaid}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Handed Over To</label>
                <select
                  className="form-select"
                  name="handedTo"
                  value={formData.handedTo}
                  onChange={handleChange}
                >
                  <option value="Rohan">Rohan</option>
                  <option value="Gururaj">Gururaj</option>
                </select>
              </div>
            </div>

            {/* Calculation summary */}
            <div className="mt-3">
              <h6 className="fw-bold">Calculation Summary</h6>
              <div className="card shadow-sm">
                <div className="card-body p-0">
                  <table className="table table-striped mb-0">
                    <tbody>
                      <tr>
                        <th>Course Fee</th>
                        <td>₹ {calcs.courseFee}</td>
                      </tr>
                      <tr>
                        <th>Discount Amount ({formData.discount || 0}%)</th>
                        <td>₹ {Number(calcs.discountAmount).toFixed(2)}</td>
                      </tr>
                      <tr className="table-info">
                        <th>Net Amount</th>
                        <td>₹ {Number(calcs.netAmount).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <th>SGST (9%)</th>
                        <td>₹ {Number(calcs.sgst).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <th>CGST (9%)</th>
                        <td>₹ {Number(calcs.cgst).toFixed(2)}</td>
                      </tr>
                      <tr className="table-warning">
                        <th>Total with GST</th>
                        <td>
                          <b>₹ {Number(calcs.totalWithGst).toFixed(2)}</b>
                        </td>
                      </tr>
                      <tr>
                        <th>Fees Paid</th>
                        <td>₹ {Number(formData.feesPaid || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="table-danger">
                        <th>Fees Remaining</th>
                        <td>
                          <b>₹ {Number(calcs.feesRemaining).toFixed(2)}</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admission-list')}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={saving}
              >
                <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
