const BalanceReceipt = (doc, row, netAmount, sgst, cgst, tableConfig) => {
  autoTable(doc, {
    ...tableConfig,
    head: [['Receipt Detail', 'Value']],
    body: [
      ['Receipt Date', row.date],
      ['Recipient', row.name],
      ['Contact Number', row.mobile],
      ['Course Enrolled', row.course],
      ['Total Fee', `₹ ${row.totalWithGst.toFixed(2)}`],
      ['Amount Paid', `₹ ${row.feesPaid.toFixed(2)}`],
      ['Balance Cleared', 'Full Paid'],
      ['Handled By', row.handedTo],
    ],
  });
};

export default BalanceReceipt;
