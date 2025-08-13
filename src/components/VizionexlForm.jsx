import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import {
  FaBook,
  FaCalendarAlt,
  FaFileInvoice,
  FaPercent,
  FaPhone,
  FaPlus,
  FaRupeeSign,
  FaUser,
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import vizionexlLogo from '../assets/vizionexlLogo.png';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function VizionexlForm() {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    course: '',
    feesPaid: '',
    handedTo: 'Rohan',
    discount: '',
    date: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Auto set today's date in IST
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

  // Fetch courses
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
        }
      } catch (err) {
        console.error('Error fetching courses', err);
        const stored = localStorage.getItem('courses');
        if (stored) setCourses(JSON.parse(stored));
      }
    };
    fetchCourses();
  }, [location.key]);

  // Real-time calculations
  useEffect(() => {
    const selectedCourse = courses.find((c) => c.name === form.course);
    const courseFee = selectedCourse ? parseFloat(selectedCourse.fee) : 0;
    const discountPercent = parseFloat(form.discount) || 0;
    const discountAmount = (courseFee * discountPercent) / 100;
    const netAmount = courseFee - discountAmount;
    const sgst = netAmount * 0.09;
    const cgst = netAmount * 0.09;
    const totalWithGst = netAmount + sgst + cgst;
    const paid = parseFloat(form.feesPaid) || 0;
    const feesRemaining = Math.max(0, totalWithGst - paid);

    setCalcs({
      courseFee,
      discountAmount,
      netAmount,
      sgst,
      cgst,
      totalWithGst,
      feesRemaining: feesRemaining.toFixed(2),
    });
  }, [form.course, form.discount, form.feesPaid, courses]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }
    if (name === 'mobile') {
      value = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    if (name === 'discount') {
      value = value.replace(/[^0-9.]/g, '');
      if (parseFloat(value) > 100) value = '100';
    }
    if (name === 'feesPaid') {
      value = value.replace(/[^0-9.]/g, '');
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.addImage(vizionexlLogo, 'PNG', 15, 10, 40, 20);
    doc.setFontSize(18).text('Vizionexl Technologies', 60, 20);
    doc.setFontSize(12).text('Registration Invoice', 60, 28);

    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Value']],
      body: [
        ['Date', form.date],
        ['Name', form.name],
        ['Mobile', form.mobile],
        ['Course', form.course],
        ['Course Fee', `₹ ${calcs.courseFee.toFixed(2)}`],
        ['Discount (%)', `${form.discount || 0}%`],
        ['Discount Amount', `₹ ${calcs.discountAmount.toFixed(2)}`],
        ['SGST (9%)', `₹ ${calcs.sgst.toFixed(2)}`],
        ['CGST (9%)', `₹ ${calcs.cgst.toFixed(2)}`],
        ['Total (With GST)', `₹ ${calcs.totalWithGst.toFixed(2)}`],
        ['Fees Paid', `₹ ${form.feesPaid || 0}`],
        ['Fees Remaining', `₹ ${calcs.feesRemaining}`],
        ['Handed Over To', form.handedTo],
      ],
    });

    return doc;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      alert('Enter a valid 10-digit Indian mobile number');
      return;
    }

    if (parseFloat(form.feesPaid) > calcs.totalWithGst) {
      alert('Fees Paid cannot exceed total payable amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        mobile: form.mobile,
        course: form.course,
        date: form.date, // Backend will convert to YYYY-MM-DD
        discount: parseFloat(form.discount) || 0,
        totalWithGst: calcs.totalWithGst,
        feesPaid: parseFloat(form.feesPaid) || 0,
        handedTo: form.handedTo,
      };

      const res = await axios.post(`${BASE_URL}/vizionexl`, payload);

      if (res.data.success) {
        alert('Registration saved successfully!');
        const pdfDoc = generatePDF();
        pdfDoc.save(`${form.name}_Vizionexl_Invoice.pdf`);

        setForm({
          name: '',
          mobile: '',
          course: courses.length ? courses[0].name : '',
          feesPaid: '',
          handedTo: 'Rohan',
          discount: '',
          date: form.date,
        });
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3" style={{ background: '#fff', color: '#000' }}>
      <div className="text-center mb-4">
        <img
          src={vizionexlLogo}
          alt="Vizionexl Logo"
          style={{ maxWidth: '200px' }}
        />
        <h4 className="fw-bold mt-2">Vizionexl Technologies Registration</h4>
      </div>

      {/* Add Course Button */}
      <div className="mb-3 text-end">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/add-course')}
        >
          <FaPlus /> Add Course
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Date */}
          <div className="col-md-3 col-12">
            <label className="form-label">
              <FaCalendarAlt /> Date
            </label>
            <input className="form-control" value={form.date} readOnly />
          </div>

          {/* Name */}
          <div className="col-md-3 col-12">
            <label className="form-label">
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

          {/* Mobile */}
          <div className="col-md-3 col-12">
            <label className="form-label">
              <FaPhone /> Mobile
            </label>
            <input
              name="mobile"
              className="form-control"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </div>

          {/* Course */}
          <div className="col-md-3 col-12">
            <label className="form-label">
              <FaBook /> Course
            </label>
            <select
              name="course"
              className="form-select"
              value={form.course}
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

          {/* Discount */}
          <div className="col-md-3 col-12">
            <label className="form-label">
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
            />
          </div>

          {/* Fees Paid */}
          <div className="col-md-3 col-12">
            <label className="form-label">
              <FaRupeeSign /> Fees Paid
            </label>
            <input
              name="feesPaid"
              type="number"
              className="form-control"
              value={form.feesPaid}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          {/* Handed To */}
          <div className="col-md-3 col-12">
            <label className="form-label">Handed Over To</label>
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
        </div>

        {/* Calculation Summary */}
        <div className="mt-4">
          <h6 className="fw-bold">Calculation Summary</h6>
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <table className="table table-striped mb-0">
                <tbody>
                  <tr>
                    <th>Course Fee</th>
                    <td>₹ {calcs.courseFee.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th>Discount Amount ({form.discount || 0}%)</th>
                    <td>₹ {calcs.discountAmount.toFixed(2)}</td>
                  </tr>
                  <tr className="table-info">
                    <th>Net Amount (after discount)</th>
                    <td>₹ {calcs.netAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th>SGST (9%)</th>
                    <td>₹ {calcs.sgst.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th>CGST (9%)</th>
                    <td>₹ {calcs.cgst.toFixed(2)}</td>
                  </tr>
                  <tr className="table-warning">
                    <th>Total with GST</th>
                    <td>
                      <b>₹ {calcs.totalWithGst.toFixed(2)}</b>
                    </td>
                  </tr>
                  <tr>
                    <th>Fees Paid</th>
                    <td>₹ {form.feesPaid || 0}</td>
                  </tr>
                  <tr className="table-danger">
                    <th>Fees Remaining</th>
                    <td>
                      <b>₹ {calcs.feesRemaining}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 d-flex gap-2 flex-wrap">
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
