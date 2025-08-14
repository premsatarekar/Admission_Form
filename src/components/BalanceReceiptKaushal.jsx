import autoTable from 'jspdf-autotable';
import kaushalKendraLogo from '../assets/kaushal-kendra-logo.jpg';

const BalanceReceipt = (doc, row, netAmount, sgst, cgst, tableConfig) => {
  doc.addImage(kaushalKendraLogo, 'PNG', 15, 10, 40, 20);
  doc.setFontSize(16).text('Vizionexl Technologies', 60, 20);
  doc.setFontSize(10).text('Balance Receipt', 60, 28);
  doc.setFontSize(40);
  doc.setTextColor(200, 200, 200);
  doc.text('Vizionexl', 105, 150, { angle: 45 });

  autoTable(doc, {
    startY: tableConfig.startY,
    head: [['Field', 'Value']],
    body: [
      ['Name', row.name],
      ['Mobile Number', row.mobile],
      ['Course', row.course],
      ['Net Amount', `₹${parseFloat(netAmount).toLocaleString('en-IN')}`],
      ['SGST (9%)', `₹${parseFloat(sgst).toLocaleString('en-IN')}`],
      ['CGST (9%)', `₹${parseFloat(cgst).toLocaleString('en-IN')}`],
      [
        'Total with GST',
        `₹${parseFloat(row.totalWithGst).toLocaleString('en-IN')}`,
      ],
      ['Amount Paid', `₹${parseFloat(row.amountPaid).toLocaleString('en-IN')}`],
      [
        'Fees Remaining',
        `₹${parseFloat(row.feesRemaining).toLocaleString('en-IN')}`,
      ],
      ['Registration Paid', row.registrationPaid ? 'Yes' : 'No'],
      ['Handed Over To', row.handedTo || 'N/A'],
      ['Payment Mode', row.paymentMode || 'Cash'],
      ...(row.paymentMode === 'PhonePe'
        ? [['UTR Number', row.utrNumber || 'N/A']]
        : []),
      ...(row.paymentMode === 'Cheque'
        ? [
            ['Bank Name', row.bankName || 'N/A'],
            ['Cheque Number', row.chequeNumber || 'N/A'],
          ]
        : []),
      ['Date', row.date || '-'],
    ],
    styles: tableConfig.styles,
  });
};

export default BalanceReceipt;
