const InvoiceType2 = (doc, row, netAmount, sgst, cgst, tableConfig) => {
  autoTable(doc, {
    ...tableConfig,
    head: [['Field', 'Details']],
    body: [
      ['Invoice Date', row.date],
      ['Client Name', row.name],
      ['Contact', row.mobile],
      ['Program', row.course],
      ['Base Fee', `₹ ${netAmount.toFixed(2)}`],
      [
        'Discount Applied',
        `(${row.discount}%) ₹${((row.discount / 100) * netAmount).toFixed(2)}`,
      ],
      ['Tax SGST', `9% ₹ ${sgst.toFixed(2)}`],
      ['Tax CGST', `9% ₹ ${cgst.toFixed(2)}`],
      ['Total Amount', `₹ ${row.totalWithGst.toFixed(2)}`],
      ['Payment Received', `₹ ${row.feesPaid.toFixed(2)}`],
      [
        'Outstanding Balance',
        row.feesRemaining <= 0
          ? 'Cleared'
          : `₹ ${row.feesRemaining.toFixed(2)}`,
      ],
      ['Assigned To', row.handedTo],
    ],
  });
};

export default InvoiceType2;
