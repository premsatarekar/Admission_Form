const InvoiceType3 = (doc, row, netAmount, sgst, cgst, tableConfig) => {
  autoTable(doc, {
    ...tableConfig,
    head: [['Category', 'Information']],
    body: [
      ['Issue Date', row.date],
      ['Customer', row.name],
      ['Phone', row.mobile],
      ['Training', row.course],
      ['Original Price', `₹ ${netAmount.toFixed(2)}`],
      [
        'Reduction',
        `(${row.discount}%) ₹${((row.discount / 100) * netAmount).toFixed(2)}`,
      ],
      ['SGST Contribution', `₹ ${sgst.toFixed(2)}`],
      ['CGST Contribution', `₹ ${cgst.toFixed(2)}`],
      ['Final Total', `₹ ${row.totalWithGst.toFixed(2)}`],
      ['Amount Paid', `₹ ${row.feesPaid.toFixed(2)}`],
      [
        'Remaining Due',
        row.feesRemaining <= 0
          ? 'Settled'
          : `₹ ${row.feesRemaining.toFixed(2)}`,
      ],
      ['Responsible Party', row.handedTo],
    ],
  });
};

export default InvoiceType3;
