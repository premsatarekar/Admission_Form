const InvoiceType1 = (doc, row, netAmount, sgst, cgst, tableConfig) => {
  autoTable(doc, {
    ...tableConfig,
    head: [['Field', 'Value']],
    body: [
      ['Date', row.date],
      ['Name', row.name],
      ['Mobile', row.mobile],
      ['Course', row.course],
      [
        'Course Fee',
        `₹ ${(netAmount + (row.discount / 100) * netAmount).toFixed(2)}`,
      ],
      [
        'Discount',
        `(${row.discount}%) ₹${((row.discount / 100) * netAmount).toFixed(2)}`,
      ],
      ['SGST (9%)', `₹ ${sgst.toFixed(2)}`],
      ['CGST (9%)', `₹ ${cgst.toFixed(2)}`],
      ['Total with GST', `₹ ${row.totalWithGst.toFixed(2)}`],
      ['Fees Paid', `₹ ${row.feesPaid.toFixed(2)}`],
      [
        'Fees Remaining',
        row.feesRemaining <= 0
          ? 'Full Paid'
          : `₹ ${row.feesRemaining.toFixed(2)}`,
      ],
      ['Handed Over To', row.handedTo],
    ],
  });
};

export default InvoiceType1;
