import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import {
  FaCheck,
  FaCheckCircle,
  FaEdit,
  FaFilePdf,
  FaSync,
  FaTrashAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import vizionexlLogo from '../assets/vizionexlLogo.png';
import BalanceReceipt from './BalanceReceipt';
import InvoiceType1 from './InvoiceType1';
// import InvoiceType2 from './InvoiceType2';
// import InvoiceType3 from './InvoiceType3';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function VizionexlFormList() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${BASE_URL}/vizionexl`, { timeout: 5000 });
      const data = res.data.data || res.data || [];
      setAdmissions(
        Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              handedTo: item.remarks?.replace('Handed to: ', '') || 'Rohan',
            }))
          : []
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admissions');
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admission?')) return;
    try {
      await axios.delete(`${BASE_URL}/vizionexl/${id}`);
      setAdmissions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const markBalancePaid = async (id) => {
    try {
      const res = await axios.patch(`${BASE_URL}/vizionexl/${id}/mark-paid`);
      if (res.data.success) {
        setAdmissions((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, feesPaid: item.totalWithGst, feesRemaining: 0 }
              : item
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark balance paid');
    }
  };

  const generatePDF = (row, type) => {
    const doc = new jsPDF();
    doc.addImage(vizionexlLogo, 'PNG', 15, 10, 40, 20);
    doc.setFontSize(16).text('Vizionexl Technologies', 60, 20);
    doc.setFontSize(10).text('Registration Invoice', 60, 28);

    // Watermark
    doc.setFontSize(40);
    doc.setTextColor(200, 200, 200);
    doc.text('Vizionexl', 105, 150, { angle: 45 });

    // Calculate GST for PDF
    const netAmount = row.totalWithGst / 1.18;
    const sgst = netAmount * 0.09;
    const cgst = netAmount * 0.09;

    let tableConfig = {
      startY: 40,
      styles: { fontSize: 8 },
    };

    switch (type) {
      case 'type1':
        InvoiceType1(doc, row, netAmount, sgst, cgst, tableConfig);
        break;
      case 'type2':
        InvoiceType2(doc, row, netAmount, sgst, cgst, tableConfig);
        break;
      case 'type3':
        InvoiceType3(doc, row, netAmount, sgst, cgst, tableConfig);
        break;
      case 'balance':
        BalanceReceipt(doc, row, netAmount, sgst, cgst, tableConfig);
        break;
      default:
        InvoiceType1(doc, row, netAmount, sgst, cgst, tableConfig);
    }

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`${row.name}_${type}_${dateStr}.pdf`);
  };

  const generateFullListPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4');
    doc.addImage(vizionexlLogo, 'PNG', 20, 10, 50, 30);
    doc.setFontSize(14).text('Admission List', 300, 25);

    const tableData = admissions.map((row, idx) => [
      idx + 1,
      row.date,
      row.name,
      row.mobile,
      row.course,
      `₹ ${(
        row.totalWithGst / 1.18 +
        (row.discount / 100) * (row.totalWithGst / 1.18)
      ).toFixed(2)}`,
      `(${row.discount}%)`,
      '(18%)',
      `₹ ${row.totalWithGst.toFixed(2)}`,
      row.feesRemaining <= 0
        ? 'Full Paid'
        : `₹ ${row.feesRemaining.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 60,
      head: [
        [
          'SL No',
          'Date',
          'Name',
          'Mobile',
          'Course',
          'Course Fee',
          'Discount',
          'GST',
          'Total with GST',
          'Balance',
        ],
      ],
      body: tableData,
      styles: { fontSize: 8 },
    });

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`Admission_List_${dateStr}.pdf`);
  };

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border text-dark" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-4 text-center">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-dark" onClick={fetchAdmissions}>
          <FaSync /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid my-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="fw-bold text-dark mb-0">Admission List</h5>
        <div className="d-flex gap-2">
          <button
            className="btn btn-dark btn-sm"
            onClick={() => navigate('/home')}
            title="Add New Admission"
          >
            +
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={generateFullListPDF}
            title="Download Full List PDF"
          >
            <FaFilePdf />
          </button>
        </div>
      </div>

      <div
        className="table-responsive"
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        <table className="table table-bordered text-center align-middle table-sm">
          <thead style={{ backgroundColor: '#f8f9fa', fontSize: '0.75rem' }}>
            <tr>
              <th>SL No</th>
              <th>Date</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Course</th>
              <th>Course Fee</th>
              <th>Discount</th>
              <th>GST</th>
              <th>Total with GST</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.75rem' }}>
            {admissions.length > 0 ? (
              admissions.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.date || '-'}</td>
                  <td>{row.name}</td>
                  <td>{row.mobile}</td>
                  <td>{row.course}</td>
                  <td>
                    ₹{' '}
                    {(
                      row.totalWithGst / 1.18 +
                      (row.discount / 100) * (row.totalWithGst / 1.18)
                    ).toLocaleString()}
                  </td>
                  <td>({row.discount}%)</td>
                  <td>(18%)</td>
                  <td>₹ {Number(row.totalWithGst).toLocaleString()}</td>
                  <td>
                    {row.feesRemaining <= 0 ? (
                      <span className="text-success fw-bold">
                        <FaCheckCircle /> Full Paid
                      </span>
                    ) : (
                      <>₹ {Number(row.feesRemaining).toLocaleString()}</>
                    )}
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                      <button
                        className="btn btn-sm btn-dark"
                        title="Edit"
                        onClick={() => navigate(`/edit/${row.id}`)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        title="Delete"
                        onClick={() => handleDelete(row.id)}
                      >
                        <FaTrashAlt />
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        title="Invoice Type 1"
                        onClick={() => generatePDF(row, 'type1')}
                      >
                        <FaFilePdf /> 1
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        title="Invoice Type 2"
                        onClick={() => generatePDF(row, 'type2')}
                      >
                        <FaFilePdf /> 2
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        title="Invoice Type 3"
                        onClick={() => generatePDF(row, 'type3')}
                      >
                        <FaFilePdf /> 3
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        title="Balance Receipt"
                        onClick={() => generatePDF(row, 'balance')}
                      >
                        <FaFilePdf /> Balance
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        title="Mark Balance Paid"
                        onClick={() => markBalancePaid(row.id)}
                        disabled={row.feesRemaining <= 0}
                      >
                        <FaCheck />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-muted">
                  No admissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
