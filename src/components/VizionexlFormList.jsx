import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaCheck,
  FaCheckCircle,
  FaDownload,
  FaEdit,
  FaExclamationTriangle,
  FaFileInvoice,
  FaHandHoldingUsd,
  FaMobileAlt,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaPlus,
  FaSearch,
  FaSync,
  FaTrash,
  FaUser,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import vizionexlLogo from '../assets/vizionexlLogo.png';
import BalanceReceipt from './BalanceReceipt';
import InvoiceType1 from './InvoiceType1';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

export default function VizionexlFormList() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [previewRow, setPreviewRow] = useState(null);
  const navigate = useNavigate();

  const formatINR = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${BASE_URL}/vizionexl`, { timeout: 10000 });
      const data = res.data.data || res.data || [];

      const processedData = Array.isArray(data)
        ? data.map((item) => {
            const totalWithGst = parseFloat(item.totalWithGst) || 0;
            const discountPercent = parseFloat(item.discount) || 0;
            const netAmount = totalWithGst / 1.18;
            const courseFee = netAmount / (1 - discountPercent / 100);
            const discountAmount = courseFee * (discountPercent / 100);
            const sgst = netAmount * 0.09;
            const cgst = netAmount * 0.09;
            const feesPaid = parseFloat(item.feesPaid) || 0;
            const feesRemaining = Math.max(0, totalWithGst - feesPaid);

            let status = 'Pending';
            if (feesRemaining === 0) status = 'Full Paid';
            else if (feesPaid > 0) status = 'Partial Paid';

            return {
              ...item,
              courseFee,
              discountAmount,
              netAmount,
              sgst,
              cgst,
              feesRemaining,
              status,
              handedTo:
                item.handedTo ||
                item.remarks?.replace('Handed to: ', '') ||
                'Rohan',
            };
          })
        : [];

      setAdmissions(processedData);
    } catch (err) {
      console.error('Error fetching admissions:', err);
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
    if (!window.confirm('Are you sure you want to delete this admission?'))
      return;
    try {
      await axios.delete(`${BASE_URL}/vizionexl/${id}`);
      setAdmissions((prev) => prev.filter((item) => item.id !== id));
      alert('Admission deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete admission');
    }
  };

  const markBalancePaid = async (id, currentStatus) => {
    const isPaid = currentStatus === 'Full Paid';
    if (
      !window.confirm(
        `Mark this admission as ${isPaid ? 'Balance Due' : 'Fully Paid'}?`
      )
    )
      return;
    try {
      const res = await axios.patch(`${BASE_URL}/vizionexl/${id}/mark-paid`);
      if (res.data.success) {
        setAdmissions((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  feesPaid: isPaid ? 0 : item.totalWithGst,
                  feesRemaining: isPaid ? item.totalWithGst : 0,
                  status: isPaid ? 'Pending' : 'Full Paid',
                }
              : item
          )
        );
        alert(`Marked as ${isPaid ? 'Balance Due' : 'Fully Paid'}!`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const generatePDF = (row, type = 'type1') => {
    const doc = new jsPDF();
    doc.addImage(vizionexlLogo, 'PNG', 15, 10, 40, 20);
    doc.setFontSize(16).text('Vizionexl Technologies', 60, 20);
    doc.setFontSize(10).text('Registration Invoice', 60, 28);

    doc.setFontSize(40);
    doc.setTextColor(200, 200, 200);
    doc.text('Vizionexl', 105, 150, { angle: 45 });

    const tableConfig = {
      startY: 40,
      styles: { fontSize: 8, halign: 'center', valign: 'middle' },
    };

    if (type === 'balance') {
      BalanceReceipt(doc, row, row.netAmount, row.sgst, row.cgst, tableConfig);
    } else {
      InvoiceType1(doc, row, row.netAmount, row.sgst, row.cgst, tableConfig);
    }

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`${row.name}_${type}_${dateStr}.pdf`);
  };

  const previewPDF = (row, type = 'type1') => {
    const doc = new jsPDF();
    doc.addImage(vizionexlLogo, 'PNG', 15, 10, 40, 20);
    doc.setFontSize(16).text('Vizionexl Technologies', 60, 20);
    doc.setFontSize(10).text('Registration Invoice', 60, 28);

    doc.setFontSize(40);
    doc.setTextColor(200, 200, 200);
    doc.text('Vizionexl', 105, 150, { angle: 45 });

    const tableConfig = {
      startY: 40,
      styles: { fontSize: 8, halign: 'center', valign: 'middle' },
    };

    if (type === 'balance') {
      BalanceReceipt(doc, row, row.netAmount, row.sgst, row.cgst, tableConfig);
    } else {
      InvoiceType1(doc, row, row.netAmount, row.sgst, row.cgst, tableConfig);
    }

    const pdfDataUri = doc.output('datauristring');
    setPreviewRow({ ...row, pdfDataUri, type });
  };

  const generateFullListPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a3');
    doc.addImage(vizionexlLogo, 'PNG', 30, 15, 60, 35);
    doc
      .setFontSize(18)
      .text('Vizionexl Technologies - Admission List', 400, 30);
    doc
      .setFontSize(12)
      .text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 400, 45);

    const tableData = filteredAdmissions.map((row, idx) => [
      idx + 1,
      row.date || '-',
      row.name,
      row.mobile,
      row.course,
      formatINR(row.courseFee),
      row.discount
        ? `${formatINR(row.discountAmount)} (${row.discount}%)`
        : '-',
      `sgst(9%,${formatINR(row.sgst)}) | cgst(9%,${formatINR(row.cgst)})`,
      row.paymentMode || 'Cash',
      formatINR(row.feesPaid || 0),
      row.status,
      row.feesRemaining > 0 ? formatINR(row.feesRemaining) : 'Nil',
    ]);

    autoTable(doc, {
      startY: 70,
      head: [
        [
          'Sl.No',
          'Date',
          'Student Name',
          'Mobile No',
          'Course',
          'Course Fee',
          'Discount',
          'GST',
          'Payment Mode',
          'Amount Paid',
          'Status',
          'Balance',
        ],
      ],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        textColor: [40, 40, 40],
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [200, 220, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [150, 150, 150],
        lineWidth: 0.5,
        halign: 'center',
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 70 },
        2: { cellWidth: 90 },
        3: { cellWidth: 80 },
        4: { cellWidth: 90 },
        5: { cellWidth: 70 },
        6: { cellWidth: 70 },
        7: { cellWidth: 90 },
        8: { cellWidth: 70 },
        9: { cellWidth: 70 },
        10: { cellWidth: 70 },
        11: { cellWidth: 70 },
      },
      margin: { top: 70, left: 20, right: 20 },
    });

    const totalRevenue = filteredAdmissions.reduce(
      (sum, row) => sum + (parseFloat(row.feesPaid) || 0),
      0
    );
    const totalPending = filteredAdmissions.reduce(
      (sum, row) => sum + (parseFloat(row.feesRemaining) || 0),
      0
    );
    const fullPaid = filteredAdmissions.filter(
      (row) => row.status === 'Full Paid'
    ).length;

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12).text('Summary:', 20, finalY);
    doc.setFontSize(10);
    doc.text(`Total Admissions: ${filteredAdmissions.length}`, 20, finalY + 15);
    doc.text(`Total Revenue: ${formatINR(totalRevenue)}`, 150, finalY + 15);
    doc.text(`Total Pending: ${formatINR(totalPending)}`, 280, finalY + 15);
    doc.text(`Full Paid: ${fullPaid}`, 410, finalY + 15);

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`Vizionexl_Admission_List_${dateStr}.pdf`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Full Paid': { class: 'success', icon: FaCheckCircle },
      'Partial Paid': { class: 'warning', icon: FaExclamationTriangle },
      Pending: { class: 'danger', icon: FaExclamationTriangle },
    };

    const config = statusConfig[status] || {
      class: 'secondary',
      icon: FaExclamationTriangle,
    };
    const IconComponent = config.icon;

    return (
      <span
        className={`badge bg-${config.class} d-flex align-items-center gap-1`}
        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
      >
        <IconComponent size={12} />
        {status}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    const statusConfig = {
      'Full Paid': <FaCheckCircle className="text-success" />,
      'Partial Paid': <FaExclamationTriangle className="text-warning" />,
      Pending: <FaExclamationTriangle className="text-danger" />,
      all: <FaSync className="text-primary" />,
    };
    return statusConfig[status] || <FaSync className="text-primary" />;
  };

  const getPaymentModeBadge = (mode, row) => {
    const modeConfig = {
      Cash: { class: 'success', icon: FaHandHoldingUsd },
      PhonePe: { class: 'primary', icon: FaMobileAlt },
      Cheque: { class: 'info', icon: FaMoneyCheckAlt },
    };

    const config = modeConfig[mode] || {
      class: 'secondary',
      icon: FaMoneyBillWave,
    };
    const IconComponent = config.icon;

    return (
      <div className="position-relative payment-hover">
        <span
          className={`badge bg-${config.class} d-flex align-items-center gap-1`}
          style={{ fontSize: '0.75rem', padding: '3px 6px', cursor: 'pointer' }}
        >
          <IconComponent size={10} />
          {mode}
        </span>
        {(mode === 'PhonePe' || mode === 'Cheque') && (
          <div
            className="hover-card position-absolute bg-white border shadow-sm p-2 rounded"
            style={{
              zIndex: 10,
              top: '100%',
              left: 0,
              display: 'none',
              minWidth: '140px',
              fontSize: '0.7rem',
            }}
          >
            {mode === 'PhonePe' && (
              <>
                <strong>UTR Number:</strong> {row.utrNumber || 'N/A'}
                <br />
                <strong>Handed To:</strong> {row.handedTo || 'N/A'}
              </>
            )}
            {mode === 'Cheque' && (
              <>
                <strong>Bank Name:</strong> {row.bankName || 'N/A'}
                <br />
                <strong>Cheque Number:</strong> {row.chequeNumber || 'N/A'}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredAdmissions = admissions.filter((admission) => {
    const matchesSearch =
      admission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.mobile?.includes(searchTerm) ||
      admission.course?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || admission.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: admissions.length,
    fullPaid: admissions.filter((a) => a.status === 'Full Paid').length,
    partialPaid: admissions.filter((a) => a.status === 'Partial Paid').length,
    pending: admissions.filter((a) => a.status === 'Pending').length,
    totalRevenue: admissions.reduce(
      (sum, a) => sum + (parseFloat(a.feesPaid) || 0),
      0
    ),
    totalPending: admissions.reduce(
      (sum, a) => sum + (parseFloat(a.feesRemaining) || 0),
      0
    ),
  };

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
          <h5 className="text-muted">Loading admissions...</h5>
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
          <button className="btn btn-primary" onClick={fetchAdmissions}>
            <FaSync className="me-2" />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-3"
      style={{ background: '#f8f9fa', minHeight: '100vh', width: '100vw' }}
    >
      <style>{`
        .table-container {
          max-height: 70vh;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #ffffff;
        }
        .table th, .table td {
          vertical-align: middle;
          padding: 6px;
          font-size: 0.75rem;
          height: 40px;
          border: 1px solid #e0e0e0;
          text-align: center;
          white-space: nowrap;
        }
        .table thead {
          position: sticky;
          top: 0;
          z-index: 1;
          background: #f0f4ff;
        }
        .action-btns .btn {
          padding: 3px 6px;
          font-size: 0.65rem;
          line-height: 1.2;
          margin: 0 2px;
          min-width: 30px;
        }
        .table tbody tr:hover {
          background: #f5faff !important;
        }
        .gst-cell div {
          line-height: 1.1;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }
        .stats-card {
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .payment-hover:hover .hover-card {
          display: block !important;
        }
        .preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .preview-content {
          background: #fff;
          padding: 15px;
          border-radius: 8px;
          max-width: 90%;
          max-height: 90%;
          overflow: auto;
        }
        @media (max-width: 768px) {
          .table-container {
            overflow-x: auto;
          }
          .table {
            min-width: 1000px;
          }
          .table th, .table td {
            padding: 4px;
            font-size: 0.7rem;
            height: 36px;
          }
          .action-btns .btn {
            padding: 2px 5px;
            font-size: 0.6rem;
            min-width: 26px;
          }
          .stats-card {
            padding: 6px;
          }
          .gst-cell div {
            gap: 3px;
          }
        }
        @media (max-width: 576px) {
          .table th, .table td {
            padding: 3px;
            font-size: 0.65rem;
            height: 32px;
          }
          .action-btns .btn {
            padding: 2px 4px;
            font-size: 0.55rem;
            min-width: 24px;
          }
          .stats-card {
            padding: 5px;
          }
          .gst-cell div {
            gap: 2px;
          }
        }
      `}</style>

      {previewRow && (
        <div className="preview-modal">
          <div className="preview-content">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>Invoice Preview</h5>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setPreviewRow(null)}
              >
                Close
              </button>
            </div>
            <iframe
              src={previewRow.pdfDataUri}
              style={{ width: '100%', height: '500px', border: 'none' }}
              title="Invoice Preview"
            />
            <button
              className="btn btn-sm btn-info mt-2"
              onClick={() => generatePDF(previewRow, previewRow.type)}
            >
              <FaDownload /> Download
            </button>
          </div>
        </div>
      )}

      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded shadow-sm">
            <div className="d-flex align-items-center">
              <img
                src={vizionexlLogo}
                alt="Vizionexl Logo"
                style={{ maxWidth: '100px' }}
                className="me-2"
              />
              <div>
                <h4 className="mb-0 text-primary fw-bold">
                  Vizionexl Admission List
                </h4>
                <small className="text-muted">
                  Track and manage student admissions
                </small>
              </div>
            </div>
            <div className="d-flex gap-1">
              <button
                className="btn btn-secondary d-flex align-items-center"
                onClick={() => navigate('/')}
                title="Back to Form"
              >
                <FaArrowLeft className="me-1" />
                Back
              </button>
              <button
                className="btn btn-success d-flex align-items-center"
                onClick={() => navigate('/home')}
                title="Add New Admission"
              >
                <FaPlus className="me-1" />
                Add
              </button>
              <button
                className="btn btn-info d-flex align-items-center"
                onClick={generateFullListPDF}
                title="Download Full List as PDF"
              >
                <FaDownload className="me-1" />
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-md-6 col-lg-3 mb-2">
          <div className="stats-card bg-light text-dark">
            <div className="d-flex align-items-center">
              <FaUser size={16} className="me-2 text-primary" />
              <div>
                <h6 className="mb-0">Total Admissions</h6>
                <h5 className="mb-0">{stats.total}</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3 mb-2">
          <div className="stats-card bg-light text-dark">
            <div className="d-flex align-items-center">
              <FaMoneyBillWave size={16} className="me-2 text-success" />
              <div>
                <h6 className="mb-0">Total Revenue</h6>
                <h5 className="mb-0">{formatINR(stats.totalRevenue)}</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3 mb-2">
          <div className="stats-card bg-light text-dark">
            <div className="d-flex align-items-center">
              <FaExclamationTriangle size={16} className="me-2 text-warning" />
              <div>
                <h6 className="mb-0">Total Pending</h6>
                <h5 className="mb-0">{formatINR(stats.totalPending)}</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3 mb-2">
          <div className="stats-card bg-light text-dark">
            <div className="d-flex align-items-center">
              <FaCheckCircle size={16} className="me-2 text-success" />
              <div>
                <h6 className="mb-0">Full Paid</h6>
                <h5 className="mb-0">{stats.fullPaid}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-md-8 mb-2 mb-md-0">
          <div className="input-group">
            <span className="input-group-text bg-light border-light">
              <FaSearch className="text-primary" />
            </span>
            <input
              type="text"
              className="form-control border-light"
              placeholder="Search by name, mobile, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-light border-light">
              {getStatusIcon(filterStatus)}
            </span>
            <select
              className="form-select border-light"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Full Paid">Full Paid</option>
              <option value="Partial Paid">Partial Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="table-container shadow-sm">
            <table className="table table-bordered mb-0">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>Sl.No</th>
                  <th style={{ width: '8%' }}>Date</th>
                  <th style={{ width: '10%' }}>Student Name</th>
                  <th style={{ width: '8%' }}>Mobile No</th>
                  <th style={{ width: '10%' }}>Course</th>
                  <th style={{ width: '8%' }}>Course Fee</th>
                  <th style={{ width: '8%' }}>Discount</th>
                  <th style={{ width: '10%' }}>GST</th>
                  <th style={{ width: '8%' }}>Payment Mode</th>
                  <th style={{ width: '8%' }}>Amount Paid</th>
                  <th style={{ width: '8%' }}>Status</th>
                  <th style={{ width: '7%' }}>Balance</th>
                  <th style={{ width: '20%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.length > 0 ? (
                  filteredAdmissions.map((row, index) => (
                    <tr key={row.id}>
                      <td className="fw-bold text-primary">{index + 1}</td>
                      <td>{row.date || '-'}</td>
                      <td className="fw-semibold">{row.name}</td>
                      <td className="font-monospace">{row.mobile}</td>
                      <td className="text-info">{row.course}</td>
                      <td className="fw-bold text-success">
                        {formatINR(row.courseFee)}
                      </td>
                      <td>
                        {row.discount > 0 ? (
                          <span className="badge bg-light text-dark border border-warning">
                            {row.discount}% ({formatINR(row.discountAmount)})
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="gst-cell">
                        <div>
                          <span className="text-success">
                            sgst(9%,{formatINR(row.sgst)})
                          </span>
                          <span>|</span>
                          <span className="text-primary">
                            cgst(9%,{formatINR(row.cgst)})
                          </span>
                        </div>
                      </td>
                      <td>{getPaymentModeBadge(row.paymentMode, row)}</td>
                      <td className="fw-bold text-primary">
                        {formatINR(row.feesPaid || 0)}
                      </td>
                      <td>{getStatusBadge(row.status)}</td>
                      <td>
                        {row.feesRemaining > 0 ? (
                          <span className="fw-bold text-danger">
                            {formatINR(row.feesRemaining)}
                          </span>
                        ) : (
                          <span className="text-success fw-bold">
                            <FaCheck className="me-1" />
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="action-btns">
                        <div className="d-flex flex-row nowrap justify-content-center gap-1">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/edit/${row.id}`)}
                            title="Edit"
                          >
                            <FaEdit size={10} />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(row.id)}
                            title="Delete"
                          >
                            <FaTrash size={10} />
                          </button>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => previewPDF(row, 'type1')}
                            title="Preview Invoice"
                          >
                            <FaFileInvoice size={10} />
                          </button>
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => generatePDF(row, 'balance')}
                            title="Download Balance Receipt"
                          >
                            <FaDownload size={10} />
                          </button>
                          <button
                            className={`btn btn-sm ${
                              row.status === 'Full Paid'
                                ? 'btn-warning'
                                : 'btn-success'
                            }`}
                            onClick={() => markBalancePaid(row.id, row.status)}
                            title={
                              row.status === 'Full Paid'
                                ? 'Mark as Balance Due'
                                : 'Mark as Paid'
                            }
                          >
                            {row.status === 'Full Paid' ? (
                              'Due'
                            ) : (
                              <FaCheck size={10} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="text-center py-4 text-muted">
                      <FaUser size={36} className="mb-2 opacity-25" />
                      <h5>No admissions found</h5>
                      <p>Try adjusting your search or add new admissions</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-md-3 col-6 mb-2">
          <div className="stats-card bg-light text-dark">
            <div className="d-flex align-items-center">
              <FaUser size={14} className="me-2 text-primary" />
              <div>
                <small className="text-muted">Showing Results</small>
                <h6 className="mb-0 text-primary">
                  {filteredAdmissions.length} / {admissions.length}
                </h6>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-2">
          <div className="stats-card bg-light text-dark">
            <div className="d-flex align-items-center">
              <FaMoneyBillWave size={14} className="me-2 text-success" />
              <div>
                <small className="text-muted">Filtered Revenue</small>
                <h6 className="mb-0 text-success">
                  {formatINR(
                    filteredAdmissions.reduce(
                      (sum, a) => sum + (parseFloat(a.feesPaid) || 0),
                      0
                    )
                  )}
                </h6>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-2">
          <div className="stats-card bg-light text-dark">
            <div className="d-flex align-items-center">
              <FaExclamationTriangle size={14} className="me-2 text-warning" />
              <div>
                <small className="text-muted">Filtered Pending</small>
                <h6 className="mb-0 text-warning">
                  {formatINR(
                    filteredAdmissions.reduce(
                      (sum, a) => sum + (parseFloat(a.feesRemaining) || 0),
                      0
                    )
                  )}
                </h6>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-2">
          <div className="stats-card bg-light text-dark">
            <div className="d-flex align-items-center">
              <FaCheckCircle size={14} className="me-2 text-success" />
              <div>
                <small className="text-muted">Collection Rate</small>
                <h6 className="mb-0 text-success">
                  {filteredAdmissions.length > 0
                    ? Math.round(
                        (filteredAdmissions.filter(
                          (a) => a.status === 'Full Paid'
                        ).length /
                          filteredAdmissions.length) *
                          100
                      )
                    : 0}
                  %
                </h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
