import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { FaEdit, FaFilePdf, FaPlusCircle, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import kaushalLogo from '../assets/kaushal-kendra-logo.jpg';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function KaushalKendraList() {
  const [admissions, setAdmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Calling API at:', `${BASE_URL}/kaushal-kendra`);
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/kaushal-kendra`);
      let data = [];
      if (Array.isArray(res.data)) data = res.data;
      else if (Array.isArray(res.data?.data)) data = res.data.data;
      setAdmissions(data);
    } catch (err) {
      console.error(
        'Error fetching admissions:',
        err.response?.data || err.message || err
      );
      alert('Failed to load admissions.');
    }
  };

  const getRowId = (row) => row.id || row._id; // Auto-detect ID type

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admission?'))
      return;
    try {
      await axios.delete(`${BASE_URL}/kaushal-kendra/${id}`);
      alert('Admission deleted successfully');
      setAdmissions((prev) => prev.filter((item) => getRowId(item) !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete admission.');
    }
  };

  const handleDownloadPDF = async (row) => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = kaushalLogo;
    await new Promise((resolve) => (img.onload = resolve));

    doc.addImage(img, 'PNG', 15, 10, 40, 20);
    doc.setFontSize(18);
    doc.text('Kaushal Kendra', 60, 20);
    doc.setFontSize(12);
    doc.text('Registration Invoice', 60, 28);

    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Value']],
      body: [
        ['Name', row.name],
        ['Mobile Number', row.mobile],
        ['ID Proof Type', row.idType],
        ['ID Proof Number', row.idNumber],
        ['Course', row.course],
        ['Registration Paid', row.registrationPaid ? 'Yes' : 'No'],
        ['Amount Paid', `₹ ${row.amountPaid}`],
        ['Fees Remaining', `₹ ${row.feesRemaining}`],
        ['Handed Over To', row.handedTo],
      ],
    });

    doc.save(`${row.name}_Kaushal_Kendra_Invoice.pdf`);
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">🎓 Kaushal Kendra Admission List</h4>
        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={() => navigate('/home')}
        >
          <FaPlusCircle /> Add New Admission
        </button>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark text-center">
            <tr>
              <th>SL No</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Course</th>
              <th>Amount Paid</th>
              <th>Fees Remaining</th>
              <th>Handed To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admissions.length > 0 ? (
              admissions.map((row, index) => {
                const id = getRowId(row);
                return (
                  <tr key={id}>
                    <td className="text-center">{index + 1}</td>
                    <td>{row.name}</td>
                    <td>{row.mobile}</td>
                    <td>{row.course}</td>
                    <td>₹ {row.amountPaid}</td>
                    <td>₹ {row.feesRemaining}</td>
                    <td>{row.handedTo}</td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center flex-wrap">
                        <button
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: '#4e73df' }}
                          onClick={() => navigate(`/kaushal-kendra/edit/${id}`)}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: '#f6c23e' }}
                          onClick={() => handleDownloadPDF(row)}
                        >
                          <FaFilePdf /> PDF
                        </button>
                        <button
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: '#e74a3b' }}
                          onClick={() => handleDelete(id)}
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted py-3">
                  No admissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
