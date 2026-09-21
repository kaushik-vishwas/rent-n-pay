import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import Order from '../models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fmtDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function money(v) {
  return `Rs. ${Number(v || 0).toLocaleString('en-IN')}`;
}

/**
 * DOWNLOAD INVOICE PDF
 * Mirrors the layout of the frontend jsPDF invoice (drawRentalInvoicePDF)
 * so emailed PDFs look identical to the user-side "My Invoices" download.
 */
export const downloadInvoicePdf = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { token } = req.query;

    const order = await Order.findById(orderId)
      .populate('products.product', 'productName')
      .lean();

    if (!order) {
      return res.status(404).send('Invoice not found');
    }

    const expectedToken = `${String(order._id)}-${order.orderNumber}`;
    if (token !== expectedToken) {
      return res.status(403).send('Invalid or expired invoice link');
    }

    // ---- Normalize data to the same shape the frontend invoice object uses ----
    const lineItems = (order.products || []).map((li) => ({
      productName: li?.product?.productName || 'Item',
      productType: li?.productType || 'rental',
      quantity: li?.quantity || 1,
      pricePerDay: Number(li?.pricePerDay || 0),
      ref: li?.ref || null,
      hsn: li?.hsn || null,
    }));

    const invoice = {
      invoiceId: `#INV-${String(order.orderNumber || 0).padStart(4, '0')}`,
      orderRef: `ORD-${String(order.orderNumber || 0).padStart(4, '0')}`,
      date: order.createdAt,
      baseRentalCost: order.baseRentalCost || 0,
      discountAmount: order.discountAmount || 0,
      lateFee: 0, // not tracked on Order schema — frontend invoice shows 0 too
      gst: order.gst || 0,
      deposit: order.refundableDeposit || 0,
      careTax: order.careProtection || 0, // schema field is "careProtection"
      deliveryPackaging: order.deliveryPackaging || order.deliveryFee || 0,
      installationFee: order.installationFee || 0,
      platformFee: order.platformFee || 0,
      relocationWarranty: order.relocationWarranty || 0,
      repairWarranty: order.repairWarranty || 0,
      amount: order.totalAmount || 0,
      name: order.name || '—',
      phone: order.phone || '—',
      address: order.address || '—',
      lineItems,
    };

    // ---- Build PDF ----
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoice.invoiceId.replace('#', '')}.pdf"`,
    );
    doc.pipe(res);

    const pageW = doc.page.width;
    const marginX = 40;
    const rightX = pageW - marginX;

    // Header title
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(`Invoice - ${invoice.invoiceId}`, marginX, 40);
    let y = doc.y + 5;
    doc.strokeColor('#e6e6e6').moveTo(marginX, y).lineTo(rightX, y).stroke();
    y += 14;

    // Logo (optional — put logo.png in assets/email/)
    const logoPath = path.join(
      __dirname,
      '..',
      'assets',
      'email',
      'rentnpay-logo.png',
    );
    try {
      doc.image(logoPath, marginX, y - 8, { width: 32, height: 32 });
    } catch (e) {
      // no logo, skip silently
    }

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('Rentnpay Commerce LLP', marginX + 40, y - 2);
    doc.fontSize(9).font('Helvetica');
    doc.text('LLPIN: ACX-5815', marginX + 40, y + 12);
    doc.text('GSTIN: 27ABNFR6490F1ZO', marginX + 40, y + 22);

    // Address block (right, right-aligned)
    const addrLines = [
      'State: Maharashtra || State Code: 27',
      'City: Pune',
      'Address: B1-1002, Sr. No. 41/1/1,',
      'Near Kakde Terrace, Warje,',
      'Pune – 411058, Maharashtra, India.',
    ];
    let addrY = y - 4;
    doc.fontSize(9);
    addrLines.forEach((line) => {
      doc.text(line, marginX, addrY, {
        width: rightX - marginX,
        align: 'right',
      });
      addrY += 12;
    });

    y = Math.max(y + 44, addrY + 8);

    // Gray "Invoice Details / Billed to" box
    const rentalItems = lineItems.filter((li) =>
      ['rent', 'rental'].includes((li.productType || '').toLowerCase()),
    );
    const extraDepositLines =
      invoice.deposit > 0 && rentalItems.length > 0
        ? rentalItems.length > 1
          ? rentalItems.length + 1
          : 1
        : 0;
    const dynamicFeeRows = [
      ['Care & Protection', invoice.careTax],
      ['Delivery & Packaging', invoice.deliveryPackaging],
      ['Installation Fee', invoice.installationFee],
      ['Platform Fee', invoice.platformFee],
      ['Relocation Warranty', invoice.relocationWarranty],
      ['Repair & Warranty', invoice.repairWarranty],
    ].filter(([, v]) => v > 0);

    const boxHeight = 130 + (extraDepositLines + dynamicFeeRows.length) * 14;
    const boxTop = y;
    doc.rect(marginX, boxTop, rightX - marginX, boxHeight).fill('#f5f7fa');
    doc.fillColor('#000');

    // Invoice Details (left)
    let leftY = boxTop + 14;
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Invoice Details', marginX + 10, leftY);
    leftY += 16;
    doc.fontSize(9).font('Helvetica');

    const details = [
      ['Order Number', invoice.orderRef],
      ['Order Placed', fmtDate(invoice.date)],
      ['Total Rate', money(invoice.baseRentalCost)],
      invoice.discountAmount > 0
        ? ['Total Discount', money(invoice.discountAmount)]
        : null,
      invoice.lateFee > 0 ? ['Total Late Fee', money(invoice.lateFee)] : null,
      ['Gst', money(invoice.gst)],
    ].filter(Boolean);
    details.forEach(([label, val]) => {
      doc
        .font('Helvetica-Bold')
        .text(label, marginX + 10, leftY, { continued: false });
      doc.font('Helvetica').text(String(val), marginX + 110, leftY);
      leftY += 14;
    });

    if (invoice.deposit > 0 && rentalItems.length > 0) {
      doc
        .font('Helvetica-Bold')
        .text('Refundable Deposit', marginX + 10, leftY);
      if (rentalItems.length > 1) {
        leftY += 14;
        const perItem = invoice.deposit / rentalItems.length;
        rentalItems.forEach((li) => {
          doc
            .font('Helvetica')
            .text(
              `(${li.productName}): ${money(perItem)}`,
              marginX + 16,
              leftY,
            );
          leftY += 14;
        });
      } else {
        doc
          .font('Helvetica')
          .text(money(invoice.deposit), marginX + 110, leftY);
        leftY += 14;
      }
    }

    dynamicFeeRows.forEach(([label, val]) => {
      doc.font('Helvetica-Bold').text(label, marginX + 10, leftY);
      doc.font('Helvetica').text(money(val), marginX + 110, leftY);
      leftY += 14;
    });

    leftY += 6;
    doc.fontSize(13).font('Helvetica-Bold');
    doc.text('Net Payable', marginX + 10, leftY);
    doc.text(money(invoice.amount), marginX + 110, leftY);

    // Billed to (right)
    let rightY = boxTop + 14;
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Billed to', marginX, rightY, {
        width: rightX - marginX - 10,
        align: 'right',
      });
    rightY += 16;
    doc.fontSize(9).font('Helvetica');
    [invoice.name, invoice.phone, invoice.address].forEach((line) => {
      doc.text(line, marginX, rightY, {
        width: rightX - marginX - 10,
        align: 'right',
      });
      rightY += 12;
    });

    y = boxTop + boxHeight + 20;

    // Line items heading
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Invoice Item(s) Details', marginX, y);
    y += 20;

    // Table header
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#6e6e6e');
    doc.text('S.No', marginX + 2, y);
    doc.text('Particulars', marginX + 40, y);
    doc.text('Rate', marginX + 230, y);
    doc.text('Coupon\nDiscount', marginX + 290, y);
    doc.text('Late\nFees', marginX + 360, y);
    doc.text('GST', rightX - 40, y);
    doc.fillColor('#000').font('Helvetica');
    y += 20;

    const gstPerItem = lineItems.length ? invoice.gst / lineItems.length : 0;
    const discountPerItem = lineItems.length
      ? invoice.discountAmount / lineItems.length
      : 0;
    const lateFeePerItem = lineItems.length
      ? invoice.lateFee / lineItems.length
      : 0;

    lineItems.forEach((li, idx) => {
      const rowTop = y;

      doc.fontSize(8);
      doc.text(String(idx + 1), marginX + 2, rowTop);
      doc.text(
        `Item: ${li.productName} (${li.productType})\nQty: ${li.quantity}` +
          (li.ref ? `\nRef: ${li.ref}` : '') +
          (li.hsn ? `\nHSN/SAC: ${li.hsn}` : ''),
        marginX + 40,
        rowTop,
        { width: 180 },
      );
      doc.text(money(li.pricePerDay), marginX + 230, rowTop);
      doc.text(money(discountPerItem), marginX + 290, rowTop);
      doc.text(money(lateFeePerItem), marginX + 360, rowTop);
      doc.text(`Rs.${gstPerItem.toFixed(2)}`, rightX - 40, rowTop);

      const rowHeight = Math.max(
        doc.heightOfString(li.productName, { width: 180 }) + 40,
        50,
      );
      doc
        .rect(marginX, rowTop - 4, rightX - marginX, rowHeight)
        .stroke('#e1e1e1');
      y = rowTop + rowHeight + 6;
    });

    y += 10;
    doc
      .fontSize(9)
      .fillColor('#888')
      .text(
        'This is a system-generated document. No signature required.',
        marginX,
        y,
      );

    doc.end();
  } catch (error) {
    console.error('Invoice PDF generation error:', error);
    res.status(500).send('Failed to generate invoice');
  }
};
