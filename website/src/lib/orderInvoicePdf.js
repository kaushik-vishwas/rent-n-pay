import jsPDF from 'jspdf';

function fmt(n) {
  return Number(n || 0).toLocaleString('en-IN');
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Draws an invoice PDF for a single order (works for both Rent and Buy
 * product lines), styled the same as the InvoiceAgreement PDF generator.
 */
function drawOrderInvoicePDF(pdf, order, selectedLine, displayRef) {
  const pageW = 210;
  const marginX = 14;
  const rightX = pageW - marginX;
  let y = 20;

  const isSell =
    String(selectedLine?.productType || '').toLowerCase() === 'sell';
  const productName =
    (selectedLine?.product && typeof selectedLine.product === 'object'
      ? selectedLine.product.productName || selectedLine.product.title
      : null) ||
    selectedLine?.variantName ||
    'Item';
  const qty = Number(selectedLine?.quantity || 1);
  const unitPrice = Number(
    selectedLine?.pricePerDay || selectedLine?.price || 0,
  );
  const taxable = unitPrice * qty;

  const gst = Number(order?.gst || 0);
  const discount = Number(order?.discountAmount || 0);
  const deposit = !isSell ? Number(selectedLine?.refundableDeposit || 0) : 0;
  const deliveryFee = Number(
    order?.deliveryPackaging || order?.deliveryFee || 0,
  );
  const netPayable = taxable + gst - discount + deposit + deliveryFee;

  // Header title
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Invoice - ${displayRef}`, marginX, y);
  pdf.setFont(undefined, 'normal');

  y += 5;
  pdf.setDrawColor(230);
  pdf.line(marginX, y, rightX, y);

  // Logo + company block (left)
  const logoY = y + 14;
  pdf.setFillColor(255, 140, 0);
  pdf.circle(marginX + 8, logoY, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont(undefined, 'bold');
  pdf.text('R', marginX + 8, logoY + 2.5, { align: 'center' });
  pdf.setTextColor(0, 0, 0);

  pdf.setFontSize(14);
  pdf.text('Rentnpay Commerce LLP', marginX + 20, logoY - 2);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  pdf.text('LLPIN: ACX-5815', marginX + 20, logoY + 4);
  pdf.text('GSTIN: 27ABNFR6490F1ZO', marginX + 20, logoY + 9);

  // Address block (right, right-aligned)
  pdf.setFontSize(9);
  const addrLines = [
    'State: Maharashtra || State Code: 27',
    'City: Pune',
    'Address: B1-1002, Sr. No. 41/1/1,',
    'Near Kakde Terrace, Warje,',
    'Pune \u2013 411058, Maharashtra, India.',
  ];
  let addrY = y + 8;
  addrLines.forEach((line) => {
    pdf.text(line, rightX, addrY, { align: 'right' });
    addrY += 5;
  });

  y = Math.max(logoY + 16, addrY + 4);

  // Gray "Invoice Details / Billed to" box
  const boxTop = y;
  const extraDepositLine = deposit > 0 ? 1 : 0;
  const extraDeliveryLine = deliveryFee > 0 ? 1 : 0;
  const boxHeight = 62 + (extraDepositLine + extraDeliveryLine) * 6;
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

  let leftY = boxTop + 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Invoice Details', marginX + 6, leftY);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  const details = [
    ['Order Number', displayRef],
    ['Order placed', fmtDate(order?.createdAt)],
    ['Total Rate', `Rs. ${fmt(taxable)}`],
    ['Total Discount', `Rs. ${fmt(discount)}`],
    ['Gst', `Rs. ${fmt(gst)}`],
  ];
  leftY += 7;
  details.forEach(([label, val]) => {
    pdf.setFont(undefined, 'bold');
    pdf.text(label, marginX + 6, leftY);
    pdf.setFont(undefined, 'normal');
    pdf.text(String(val), marginX + 45, leftY);
    leftY += 6;
  });

  if (deposit > 0) {
    pdf.setFont(undefined, 'bold');
    pdf.text('Refundable Deposit', marginX + 6, leftY);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Rs. ${fmt(deposit)}`, marginX + 45, leftY);
    leftY += 6;
  }

  if (deliveryFee > 0) {
    pdf.setFont(undefined, 'bold');
    pdf.text('Delivery & Packaging', marginX + 6, leftY);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Rs. ${fmt(deliveryFee)}`, marginX + 45, leftY);
    leftY += 6;
  }

  leftY += 2;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Net Payable', marginX + 6, leftY);
  pdf.text(`Rs. ${fmt(netPayable)}`, marginX + 45, leftY);
  pdf.setFont(undefined, 'normal');

  // Billed to (right side of box)
  let rightY = boxTop + 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Billed to', rightX - 6, rightY, { align: 'right' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  rightY += 7;
  pdf.text(order?.name || '\u2014', rightX - 6, rightY, { align: 'right' });
  rightY += 5;
  pdf.text(order?.phone || '\u2014', rightX - 6, rightY, { align: 'right' });
  rightY += 5;
  const addr = order?.address || '\u2014';
  const addrWrapped = pdf.splitTextToSize(addr, 70);
  addrWrapped.forEach((line) => {
    pdf.text(line, rightX - 6, rightY, { align: 'right' });
    rightY += 5;
  });

  y = boxTop + boxHeight + 12;

  // Invoice Item Details heading
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Invoice Item Details', marginX, y);
  pdf.setFont(undefined, 'normal');
  y += 8;

  const cols = [
    { label: 'S.No', x: marginX + 2, w: 8 },
    { label: 'Particulars', x: marginX + 12, w: 82 },
    { label: 'Rate', x: marginX + 100, w: 20 },
    { label: 'Taxable\nValue', x: marginX + 140, w: 18, align: 'right' },
    { label: 'GST', x: rightX - 2, w: 18, align: 'right' },
  ];

  pdf.setFontSize(8);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(110);
  cols.forEach((c) => {
    pdf.text(c.label, c.x, y, c.align ? { align: c.align } : undefined);
  });
  pdf.setTextColor(0, 0, 0);
  pdf.setFont(undefined, 'normal');
  y += 6;

  const rowTop = y;
  const itemNameWrapped = pdf.splitTextToSize(
    `Item: ${productName} (${isSell ? 'Buy' : 'Rent'})`,
    cols[1].w,
  );
  const particularLines = [...itemNameWrapped, `Qty: ${qty}`].filter(Boolean);

  pdf.setFontSize(8);
  pdf.text('1', cols[0].x, rowTop + 4);
  pdf.text(particularLines, cols[1].x, rowTop + 4);
  pdf.text(`Rs.${fmt(unitPrice)}`, cols[2].x, rowTop + 4);
  pdf.text(`Rs.${fmt(taxable)}`, cols[3].x, rowTop + 4, { align: 'right' });
  pdf.text(`Rs.${fmt(gst)}`, cols[4].x, rowTop + 4, { align: 'right' });

  const rowHeight = Math.max(particularLines.length * 4.2 + 4, 14);
  pdf.setDrawColor(225);
  pdf.roundedRect(marginX, rowTop - 4, rightX - marginX, rowHeight, 2, 2, 'S');
  y = rowTop + rowHeight + 4;

  y += 4;
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    'This is a system-generated document. No signature required.',
    marginX,
    y,
  );
  pdf.setTextColor(0, 0, 0);
}

/**
 * Generates and downloads a PDF invoice for the given order + selected
 * product line. Works for both Rent and Buy product types.
 */
export function downloadOrderInvoicePDF(order, selectedLine, displayRef) {
  const pdf = new jsPDF();
  drawOrderInvoicePDF(pdf, order, selectedLine, displayRef);
  pdf.save(`${String(displayRef).replace('#', '')}.pdf`);
}
