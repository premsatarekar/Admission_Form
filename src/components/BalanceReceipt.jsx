import 'jspdf-autotable';

const InvoiceType1 = (doc, row, netAmount, sgst, cgst, tableConfig) => {
  // Set document properties
  doc.setProperties({
    title: `Invoice - ${row.name}`,
    subject: 'Course Enrollment Invoice',
    author: 'Vizionexl Technologies',
    keywords: 'invoice, course, payment',
    creator: 'Vizionexl Technologies',
  });

  // Add logo and header
  doc.addImage(vizionexlLogo, 'PNG', 15, 10, 40, 20);
  doc
    .setFontSize(16)
    .setTextColor(40, 40, 40)
    .text('Vizionexl Technologies', 60, 20);
  doc
    .setFontSize(10)
    .setTextColor(100, 100, 100)
    .text('Invoice for Course Enrollment', 60, 28);

  // Invoice details section
  doc.setFontSize(12).setTextColor(40, 40, 40);
  doc.text(
    `Invoice #: ${
      row.invoiceNumber || 'VZL-' + Math.floor(1000 + Math.random() * 9000)
    }`,
    14,
    50
  );
  doc.text(`Date: ${row.date || new Date().toLocaleDateString()}`, 14, 60);
  doc.text(
    `Due Date: ${
      row.dueDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }`,
    14,
    70
  );

  // Student details section
  doc.text(`Student Name: ${row.name}`, 110, 50);
  doc.text(`Contact: ${row.mobile}`, 110, 60);
  doc.text(`Course: ${row.course}`, 110, 70);

  // Add watermark
  doc.setFontSize(40).setTextColor(230, 230, 230);
  doc.text('Vizionexl', 105, 150, { angle: 45 });

  // Invoice items table
  doc.autoTable({
    startY: 90,
    head: [['DESCRIPTION', 'PRICE', 'TOTAL']],
    body: [
      [
        'Course Fee',
        formatCurrency(row.courseFee),
        formatCurrency(row.courseFee),
      ],
      [
        'Discount',
        `-${formatCurrency(row.discountAmount)} (${row.discount}%)`,
        `-${formatCurrency(row.discountAmount)}`,
      ],
      ['Net Amount', formatCurrency(netAmount), formatCurrency(netAmount)],
      ['SGST (9%)', formatCurrency(sgst), formatCurrency(sgst)],
      ['CGST (9%)', formatCurrency(cgst), formatCurrency(cgst)],
      ['Total Amount', '', formatCurrency(row.totalWithGst)],
      ['Amount Paid', '', formatCurrency(row.feesPaid)],
      ['Balance Due', '', formatCurrency(row.feesRemaining)],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 5,
      halign: 'left',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [70, 130, 180],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { halign: 'right', cellWidth: 50 },
      2: { halign: 'right', cellWidth: 50, fontStyle: 'bold' },
    },
    didDrawCell: (data) => {
      if (
        data.section === 'body' &&
        data.column.index === 2 &&
        data.row.index >= 5
      ) {
        doc.setFontStyle('bold');
        doc.setTextColor(40, 40, 40);
      }
    },
  });

  // Footer section
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(10).setTextColor(40, 40, 40);
  doc.text('Thank you for enrolling with Vizionexl Technologies!', 14, finalY);

  // Terms and conditions
  doc.setFontSize(8).setTextColor(100, 100, 100);
  doc.text('Terms & Conditions:', 14, finalY + 10);
  doc.text(
    '1. All fees paid are non-refundable under any circumstances once payment is made.',
    14,
    finalY + 15
  );
  doc.text(
    '2. Course access will be provided only after full payment is received and confirmed.',
    14,
    finalY + 20
  );
  doc.text(
    '3. All payments must be made in the currency and mode mentioned in the invoice.',
    14,
    finalY + 25
  );
  doc.text(
    '4. Completion certificates will be issued only upon meeting all course requirements.',
    14,
    finalY + 30
  );
  doc.text(
    '5. The company reserves the right to change course schedules or trainers.',
    14,
    finalY + 35
  );

  // Signature line
  doc.setFontSize(10).setTextColor(40, 40, 40);
  doc.text('Authorized Signature: ___________________', 14, finalY + 50);
  doc.text('Vizionexl Technologies', 14, finalY + 60);
};

// Helper function to format currency
const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return `₹ ${num.toFixed(2)}`;
};

export default InvoiceType1;
