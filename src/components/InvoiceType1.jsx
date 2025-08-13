import autoTable from 'jspdf-autotable';

const InvoiceType1 = (doc, row, netAmount, sgst, cgst, tableConfig) => {
  // Convert string values to numbers to prevent toFixed errors
  const totalWithGst = Number(row.totalWithGst);
  const feesPaid = Number(row.feesPaid);
  const feesRemaining = Number(row.feesRemaining);
  const discount = Number(row.discount);
  const netAmountNum = Number(netAmount);
  const sgstNum = Number(sgst);
  const cgstNum = Number(cgst);

  autoTable(doc, {
    ...tableConfig,
    head: [['Field', 'Value']],
    body: [
      ['Date', row.date || '-'],
      ['Name', row.name],
      ['Mobile', row.mobile],
      ['Course', row.course],
      [
        'Course Fee',
        `₹ ${(netAmountNum + (discount / 100) * netAmountNum).toFixed(2)}`,
      ],
      [
        'Discount',
        `(${discount}%) ₹${((discount / 100) * netAmountNum).toFixed(2)}`,
      ],
      ['SGST (9%)', `₹ ${sgstNum.toFixed(2)}`],
      ['CGST (9%)', `₹ ${cgstNum.toFixed(2)}`],
      ['Total with GST', `₹ ${totalWithGst.toFixed(2)}`],
      ['Fees Paid', `₹ ${feesPaid.toFixed(2)}`],
      [
        'Fees Remaining',
        feesRemaining <= 0 ? 'Full Paid' : `₹ ${feesRemaining.toFixed(2)}`,
      ],
      ['Handed Over To', row.handedTo],
    ],
  });
};

export default InvoiceType1;
