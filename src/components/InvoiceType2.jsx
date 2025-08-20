import html2pdf from 'html2pdf.js';
import { FaCheck } from 'react-icons/fa';
import vizionexlLogo from '../assets/vizionexlLogo.png';

const InvoiceType2 = ({ row, onClose }) => {
  // Calculate amounts with proper formatting
  const courseFee = parseFloat(row.courseFee) || 0;
  const discountAmount = parseFloat(row.discountAmount) || 0;
  const netAmount = courseFee - discountAmount;
  const sgst = parseFloat((netAmount * 0.09).toFixed(2));
  const cgst = parseFloat((netAmount * 0.09).toFixed(2));
  const totalWithGst = netAmount + sgst + cgst;
  const feesPaid = parseFloat(row.amountPaid) || 0;
  const feesRemaining = Math.max(0, totalWithGst - feesPaid);

  // Format INR currency with proper spacing and symbols
  const formatINR = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(num)
      .replace('₹', '₹ ');
  };

  const handleGeneratePDF = () => {
    const element = document.getElementById('invoice');
    const opt = {
      margin: 10,
      filename: `Balance_Receipt_${row.name || 'Student'}_${new Date()
        .toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short',
        })
        .replace(/,/g, '')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().from(element).set(opt).save();
    if (onClose) onClose();
  };

  return (
    <div
      className="container"
      id="invoice"
      style={{ maxWidth: '210mm', margin: '0 auto', padding: '20px' }}
    >
      {/* Header Section */}
      <div className="text-center mb-4">
        <img
          src={vizionexlLogo}
          alt="Logo"
          style={{ height: '50px' }}
          className="mb-2"
        />
        <h2 className="fw-bold mb-1">VIZIONEXL TECHNOLOGIES</h2>
        <p className="text-muted mb-0">Balance Receipt</p>
      </div>

      {/* Receipt Details */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-0">
            <div className="card-body p-2">
              <h6 className="fw-bold">Receipt Details</h6>
              <p className="mb-1">
                Receipt #: {row.receiptNumber || 'VZL-RCPT-00000'}
              </p>
              <p className="mb-1">
                Date:{' '}
                {row.date ||
                  new Date()
                    .toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                    .replace(/,/g, '')}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0">
            <div className="card-body p-2">
              <h6 className="fw-bold">Student Details</h6>
              <p className="mb-1">Name: {row.name || 'N/A'}</p>
              <p className="mb-1">Contact: {row.mobile || 'N/A'}</p>
              <p className="mb-1">Course: {row.course || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Table */}
      <div className="table-responsive mb-4">
        <table className="table table-bordered">
          <thead className="table-primary">
            <tr>
              <th className="text-center" style={{ width: '60%' }}>
                Description
              </th>
              <th className="text-center" style={{ width: '40%' }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Course Fee (with GST)</td>
              <td className="text-end fw-bold">{formatINR(totalWithGst)}</td>
            </tr>
            <tr>
              <td>Amount Paid</td>
              <td className="text-end fw-bold">{formatINR(feesPaid)}</td>
            </tr>
            <tr
              className={feesRemaining > 0 ? 'table-danger' : 'table-success'}
            >
              <td className="fw-bold">Balance Due</td>
              <td className="text-end fw-bold">{formatINR(feesRemaining)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Status Indicator */}
      <div
        className={`text-center py-2 ${
          feesRemaining > 0
            ? 'bg-danger bg-opacity-10'
            : 'bg-success bg-opacity-10'
        } rounded`}
      >
        <h6 className="mb-0">
          Status: {feesRemaining > 0 ? 'Pending' : 'Fully Paid'}{' '}
          {feesRemaining === 0 && <FaCheck className="text-success" />}
        </h6>
      </div>

      {/* Footer Section */}
      <div className="bg-warning bg-opacity-10 p-3 mb-3 rounded">
        <p className="mb-0 text-center fw-bold">
          Thank you for your payment with VIZIONEXL TECHNOLOGIES!
        </p>
      </div>

      <div className="card border-0 mb-4">
        <div className="card-body p-3">
          <h6 className="fw-bold mb-2">Notes:</h6>
          <ul className="mb-0" style={{ fontSize: '0.9rem' }}>
            <li>Payment receipt is valid only upon clearance.</li>
            <li>Contact support for any discrepancies.</li>
            <li>Balance must be cleared before course completion.</li>
          </ul>
        </div>
      </div>

      {/* Generate PDF Button */}
      <div className="text-center">
        <button className="btn btn-primary" onClick={handleGeneratePDF}>
          <FaCheck className="me-2" /> Generate Receipt
        </button>
      </div>

      {/* Watermark */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          opacity: 0.1,
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        <h1 className="display-4 fw-bold text-muted">VIZIONEXL TECHNOLOGIES</h1>
      </div>
    </div>
  );
};

export default InvoiceType2;
