// 'use client';
// import React, { useRef, useEffect, useState } from 'react';
// import {
//   X,
//   Download,
//   CheckCircle,
//   Briefcase,
//   User,
//   Calendar,
//   Clock,
//   CreditCard,
//   User2,
//   FileText,
//   CheckCircle2,
// } from 'lucide-react';
// import jsPDF from 'jspdf';
// import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';

// function loadImageAsDataUrl(src) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = 'anonymous';
//     img.onload = () => {
//       try {
//         const canvas = document.createElement('canvas');
//         canvas.width = img.naturalWidth;
//         canvas.height = img.naturalHeight;
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(img, 0, 0);
//         resolve(canvas.toDataURL('image/png'));
//       } catch (e) {
//         reject(e);
//       }
//     };
//     img.onerror = reject;
//     img.src = src;
//   });
// }

// function drawServiceInvoicePDF(pdf, data, logoDataUrl) {
//   const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
//   const taxLines = Array.isArray(data.taxLines) ? data.taxLines : [];
//   const invoiceNo = `INV-${(data.jobId || 'SRV-0000').replace(/[^A-Za-z0-9-]/g, '')}`;
//   const issuedOn = new Date().toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   });

//   const pageW = 210;
//   const marginX = 14;
//   const rightX = pageW - marginX;
//   let y = 20;

//   // Header title
//   pdf.setFontSize(18);
//   pdf.setFont(undefined, 'bold');
//   pdf.text(`Invoice - ${invoiceNo}`, marginX, y);
//   pdf.setFont(undefined, 'normal');

//   y += 5;
//   pdf.setDrawColor(230);
//   pdf.line(marginX, y, rightX, y);

//   // Logo + company block (left)
//   const logoY = y + 14;
//   if (logoDataUrl) {
//     try {
//       pdf.addImage(logoDataUrl, 'PNG', marginX, logoY - 8, 16, 16);
//     } catch (e) {
//       // fall back silently if the image fails to embed
//     }
//   }

//   pdf.setFontSize(14);
//   pdf.text('Rentnpay Commerce LLP', marginX + 20, logoY - 2);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   pdf.text('LLPIN: ACX-5815', marginX + 20, logoY + 4);
//   pdf.text('GSTIN: 27ABNFR6490F1ZO', marginX + 20, logoY + 9);

//   // Address block (right, right-aligned)
//   pdf.setFontSize(9);
//   const addrLines = [
//     'State: Maharashtra || State Code: 27',
//     'City: Pune',
//     'Address: B1-1002, Sr. No. 41/1/1,',
//     'Near Kakde Terrace, Warje,',
//     'Pune \u2013 411058, Maharashtra, India.',
//   ];
//   let addrY = y + 8;
//   addrLines.forEach((line) => {
//     pdf.text(line, rightX, addrY, { align: 'right' });
//     addrY += 5;
//   });

//   y = Math.max(logoY + 16, addrY + 4);

//   // Gray "Invoice Details / Billed to" box
//   const boxTop = y;
//   const hasTechnician = data.technicianName && data.technicianName !== '—';
//   const hasTimeSlot = !!data.timeSlot;
//   const boxHeight = 62 + (hasTechnician ? 6 : 0) + (hasTimeSlot ? 6 : 0);
//   pdf.setFillColor(245, 247, 250);
//   pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

//   let leftY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Invoice Details', marginX + 6, leftY);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);

//   const details = [
//     ['Job ID', data.jobId || '—'],
//     [
//       'Service',
//       `${data.serviceName || '—'}${data.serviceType ? ` (${data.serviceType})` : ''}`,
//     ],
//     ['Date', data.bookingDate || '—'],
//   ];
//   if (hasTimeSlot) details.push(['Time Slot', data.timeSlot]);
//   if (hasTechnician) details.push(['Technician', data.technicianName]);
//   details.push(['Payment Method', formatMethodForPDF(data.paymentMethod)]);

//   leftY += 7;
//   details.forEach(([label, val]) => {
//     pdf.setFont(undefined, 'bold');
//     pdf.text(label, marginX + 6, leftY);
//     pdf.setFont(undefined, 'normal');
//     const wrapped = pdf.splitTextToSize(String(val), 55);
//     pdf.text(wrapped, marginX + 45, leftY);
//     leftY += 6 * wrapped.length;
//   });

//   // Billed to (right side of box)
//   let rightY = boxTop + 10;
//   pdf.setFontSize(12);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Billed to', rightX - 6, rightY, { align: 'right' });
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);
//   rightY += 7;
//   const billedName = data.name || data.customerName || '\u2014';
//   const billedPhone = data.phone || data.customerPhone || '\u2014';
//   const billedAddress = data.address || data.customerAddress || '\u2014';

//   pdf.text(billedName, rightX - 6, rightY, { align: 'right' });
//   rightY += 5;
//   pdf.text(billedPhone, rightX - 6, rightY, { align: 'right' });
//   rightY += 5;
//   const addr = billedAddress;
//   const addrWrapped = pdf.splitTextToSize(addr, 70);
//   addrWrapped.forEach((line) => {
//     pdf.text(line, rightX - 6, rightY, { align: 'right' });
//     rightY += 5;
//   });

//   y = boxTop + boxHeight + 12;

//   // Invoice Item(s) Details heading
//   pdf.setFontSize(14);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Invoice Item(s) Details', marginX, y);
//   pdf.setFont(undefined, 'normal');
//   y += 8;

//   const cols = [
//     { label: 'S.No', x: marginX + 2, w: 8 },
//     { label: 'Particulars', x: marginX + 12, w: 100 },
//     { label: 'Amount', x: rightX - 2, w: 24, align: 'right' },
//   ];

//   pdf.setFontSize(8);
//   pdf.setFont(undefined, 'bold');
//   pdf.setTextColor(110);
//   cols.forEach((c) => {
//     pdf.text(c.label, c.x, y, c.align ? { align: c.align } : undefined);
//   });
//   pdf.setTextColor(0, 0, 0);
//   pdf.setFont(undefined, 'normal');
//   y += 6;

//   const rows = [
//     {
//       label: `Service: ${data.serviceName || '—'}`,
//       value: Number(data.serviceCharge || 0),
//     },
//     ...taxLines.map((t) => ({ label: t.label, value: Number(t.value || 0) })),
//   ];

//   rows.forEach((row, idx) => {
//     const rowTop = y;
//     const particularLines = pdf.splitTextToSize(row.label, cols[1].w);

//     pdf.setFontSize(8);
//     pdf.text(String(idx + 1), cols[0].x, rowTop + 4);
//     pdf.text(particularLines, cols[1].x, rowTop + 4);
//     pdf.text(`Rs.${fmt(row.value)}`, cols[2].x, rowTop + 4, { align: 'right' });

//     const rowHeight = Math.max(particularLines.length * 4.2 + 4, 14);
//     pdf.setDrawColor(225);
//     pdf.roundedRect(
//       marginX,
//       rowTop - 4,
//       rightX - marginX,
//       rowHeight,
//       2,
//       2,
//       'S',
//     );
//     y = rowTop + rowHeight + 4;
//   });

//   y += 2;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Total Paid', marginX + 6, y);
//   pdf.text(`Rs. ${fmt(data.totalPaid)}`, rightX - 2, y, { align: 'right' });
//   pdf.setFont(undefined, 'normal');

//   y += 10;
//   pdf.setFontSize(9);
//   pdf.setTextColor(120);
//   pdf.text(
//     'This is a system-generated document. No signature required.',
//     marginX,
//     y,
//   );
//   pdf.setTextColor(0, 0, 0);
// }

// function formatMethodForPDF(m) {
//   if (m === 'upi') return 'UPI';
//   if (m === 'card') return 'Card';
//   if (m === 'netbanking') return 'Net Banking';
//   return m || '—';
// }

// const PaymentBreakdown = ({ data }) => {
//   const [open, setOpen] = useState(false);
//   const taxLines = Array.isArray(data.taxLines) ? data.taxLines : [];
//   const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

//   return (
//     <div>
//       {/* Header row — always visible */}
//       <button
//         type="button"
//         onClick={() => setOpen((p) => !p)}
//         className="w-full flex items-center justify-between mb-3"
//       >
//         <p className="text-[13px] font-semibold text-[#64748B] tracking-widest uppercase">
//           Payment Breakdown
//         </p>
//         <span className="text-xs text-orange-500 font-medium">
//           {open ? 'Hide ▲' : 'View details ▼'}
//         </span>
//       </button>

//       <div className="space-y-2 text-[12px] text-gray-700">
//         {/* Service charge — always visible */}
//         <div className="flex justify-between">
//           <span>Service Charge</span>
//           <span className="text-black text-[13px] font-semibold">
//             ₹{fmt(data.serviceCharge)}
//           </span>
//         </div>

//         {/* Individual tax lines — visible when expanded */}
//         {open && taxLines.length > 0 && (
//           <div className="bg-slate-50 rounded-xl px-3 py-2 space-y-1.5 mt-1">
//             {taxLines.map((t) => (
//               <div key={t.label} className="flex justify-between text-[11px]">
//                 <span className="text-gray-500">{t.label}</span>
//                 <span className="text-gray-700 font-medium">
//                   ₹{fmt(t.value)}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Collapsed tax summary */}
//         {!open && taxLines.length > 0 && (
//           <div className="flex justify-between">
//             <span>Tax & Fees</span>
//             <span className="text-black text-[13px] font-semibold">
//               ₹{fmt(taxLines.reduce((s, t) => s + t.value, 0))}
//             </span>
//           </div>
//         )}

//         {taxLines.length === 0 && (
//           <div className="flex justify-between">
//             <span>Tax & Fees</span>
//             <span className="text-black text-[13px] font-semibold">₹0</span>
//           </div>
//         )}

//         <hr className="border-gray-100" />
//         <div className="flex justify-between font-bold text-base">
//           <span className="text-black">Total Paid</span>
//           <span className="text-green-600">₹{fmt(data.totalPaid)}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ServiceReceiptModal = ({ data, onClose }) => {
//   const receiptRef = useRef(null);

//   useEffect(() => {
//     document.body.style.overflow = 'hidden';

//     return () => {
//       document.body.style.overflow = 'auto';
//     };
//   }, []);

//   // const handleDownload = () => {
//   //   // Simple print-to-PDF approach
//   //   const printContent = receiptRef.current?.innerHTML;
//   //   const win = window.open('', '_blank');
//   //   win.document.write(`
//   //     <html><head><title>Service Receipt</title>
//   //     <style>
//   //       body { font-family: sans-serif; padding: 24px; max-width: 400px; margin: 0 auto; }
//   //       .green-header { background: #16a34a; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 16px; }
//   //       .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
//   //       .divider { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
//   //       .total { font-weight: bold; color: #16a34a; font-size: 15px; }
//   //       .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
//   //       .badge { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 8px; padding: 8px 12px; font-size: 12px; display: flex; justify-content: space-between; }
//   //     </style>
//   //     </head><body>${printContent}</body></html>
//   //   `);
//   //   win.document.close();
//   //   win.print();
//   // };
//   const handleDownload = async () => {
//     const invoiceNo = `INV-${(data.jobId || 'SRV-0000').replace(/[^A-Za-z0-9-]/g, '')}`;
//     let logoDataUrl = null;
//     try {
//       logoDataUrl = await loadImageAsDataUrl(RentnpayLogo.src);
//     } catch (e) {
//       // proceed without the logo if it fails to load
//     }
//     const pdf = new jsPDF();
//     drawServiceInvoicePDF(pdf, data, logoDataUrl);
//     pdf.save(`${invoiceNo}.pdf`);
//   };
//   const formatMethod = (m) => {
//     if (m === 'upi') return 'UPI • ••••@paytm';
//     if (m === 'card') return 'Card • •••• •••• ••••';
//     if (m === 'netbanking') return 'Net Banking';
//     return m;
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="bg-white w-full max-w-sm max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
//         {/* Green Header */}
//         <div className="bg-gradient-to-br from-green-500 to-green-600 px-5 pt-5 pb-8 relative">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//           <div className="mb-3">
//             <div className="flex items-center gap-2">
//               <CheckCircle2 className="w-5 h-5 text-white" />
//               <span className="text-white font-semibold text-base">
//                 Service Receipt
//               </span>
//             </div>

//             <p className="text-green-100 text-xs mt-1 ml-7">
//               Thank you for using Rentnpay!
//             </p>
//           </div>
//           <div className="mt-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm text-center">
//             <p className="text-white/80 text-xs mb-1">Total Paid</p>

//             <p className="text-white text-3xl font-bold">
//               ₹{data.totalPaid?.toLocaleString('en-IN')}
//             </p>

//             <div className="mt-2 inline-flex items-center justify-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs px-3 py-1 rounded-full mx-auto">
//               <CheckCircle2 className="w-3 h-3" />
//               Payment Successful
//             </div>
//           </div>
//         </div>

//         {/* Body — pulls up over header */}
//         <div
//           ref={receiptRef}
//           className="bg-white rounded-t-2xl -mt-4 px-5 pt-5 pb-2 overflow-y-auto flex-1 scrollbar-hide"
//           style={{ boxShadow: 'inset 0 1px 0 #f3f4f6' }}
//         >
//           <div className="bg-[#F9FAFB] px-3 py-3 rounded-lg">
//             {/* Service Details */}
//             <p className="text-[13px] font-semibold text-[#64748B] tracking-widest uppercase mb-3">
//               Service Details
//             </p>

//             <div className="space-y-2 text-sm">
//               <div className="flex items-start gap-2">
//                 <FileText className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
//                 <div>
//                   <p className="text-[10px] text-[#64748B]">Job ID</p>
//                   <p className="font-semibold text-gray-900">{data.jobId}</p>
//                 </div>
//               </div>

//               {/* <div className="flex items-start gap-2">
//                 <User2 className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
//                 <div>
//                   <p className="text-[10px] text-[#64748B]">Service</p>
//                   <p className="font-semibold text-gray-900 capitalize">
//                     {data.serviceName}
//                   </p>
//                 </div>
//               </div> */}
//               <div className="flex items-start gap-2">
//                 <User2 className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
//                 <div>
//                   <p className="text-[10px] text-[#64748B]">Service</p>
//                   <p className="font-semibold text-gray-900 capitalize flex items-center gap-2 flex-wrap">
//                     {data.serviceName}
//                     {data.serviceType ? (
//                       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 normal-case">
//                         {data.serviceType}
//                       </span>
//                     ) : null}
//                   </p>
//                 </div>
//               </div>

//               {data.technicianName && data.technicianName !== '—' && (
//                 <div className="flex items-start gap-2">
//                   <User className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
//                   <div>
//                     <p className="text-[10px] text-[#64748B]">Technician</p>
//                     <p className="font-semibold text-gray-900">
//                       {data.technicianName}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               <div className="flex items-start gap-2">
//                 <Calendar className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
//                 <div>
//                   <p className="text-[10px] text-[#64748B]">Date</p>
//                   <p className="font-semibold text-gray-900">
//                     {data.bookingDate}
//                   </p>
//                 </div>
//               </div>

//               {data.timeSlot && (
//                 <div className="flex items-start gap-2">
//                   <Clock className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
//                   <div>
//                     <p className="text-[10px] text-[#64748B]">Time</p>
//                     <p className="font-semibold text-gray-900">
//                       {data.timeSlot}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <hr className="my-4 border-gray-100" />

//           {/* Payment Breakdown */}
//           {/* <p className="text-[13px] font-semibold text-[#64748B] tracking-widest uppercase mb-3">
//             Payment Breakdown
//           </p>

//           <div className="space-y-2 text-[12px] text-gray-700">
//             <div className="flex justify-between">
//               <span>Service Charge</span>
//               <span className="text-black text-[13px] font-semibold">
//                 ₹{data.serviceCharge?.toLocaleString('en-IN')}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span>Tax & Fees</span>
//               <span className="text-black text-[13px] font-semibold">
//                 ₹{(data.taxAndFees || 0).toLocaleString('en-IN')}
//               </span>
//             </div>
//             <hr className="border-gray-100" />
//             <div className="flex justify-between font-bold text-base">
//               <span className="text-black">Total Paid</span>
//               <span className="text-green-600">
//                 ₹{data.totalPaid?.toLocaleString('en-IN')}
//               </span>
//             </div>
//           </div> */}
//           {/* Payment Breakdown */}
//           <PaymentBreakdown data={data} />

//           {/* Payment Method */}
//           {/* <div className="mt-4 flex items-center justify-between bg-[#EFF6FF] border border-[#BEDBFF] rounded-xl px-3 py-2.5">
//             <div className="flex items-center gap-2">
//               <span className="text-xs text-[#193CB8]">Payment Method</span>
//             </div>
//             <span className="text-xs font-semibold text-[#193CB8]">
//               {formatMethod(data.paymentMethod)}
//             </span>
//           </div> */}
//         </div>

//         {/* Footer */}
//         <div className="px-5 pb-5 pt-3 space-y-2">
//           <button
//             onClick={handleDownload}
//             className="w-full py-3 rounded-xl border-2 border-orange-400 text-orange-500 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
//           >
//             <Download className="w-4 h-4" />
//             Download Invoice
//           </button>

//           <p className="text-center text-[10px] text-[#64748B]">
//             Need help? Contact support at{' '}
//             <a
//               href="mailto:support@rentnpay.com"
//               className="text-[#193CB8] text-[13px] font-medium"
//             >
//               support@rentnpay.com
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ServiceReceiptModal;

'use client';
import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  CheckCircle,
  Briefcase,
  User,
  Calendar,
  Clock,
  CreditCard,
  User2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import RentnpayLogo from '@/assets/icons/rentnpay-logo.png';

function loadImageAsDataUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = src;
  });
}

function drawServiceInvoicePDF(pdf, data, logoDataUrl) {
  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
  const taxLines = Array.isArray(data.taxLines) ? data.taxLines : [];
  const invoiceNo = `INV-${(data.jobId || 'SRV-0000').replace(/[^A-Za-z0-9-]/g, '')}`;
  const issuedOn = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const pageW = 210;
  const marginX = 14;
  const rightX = pageW - marginX;
  let y = 20;

  // Header title
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Invoice - ${invoiceNo}`, marginX, y);
  pdf.setFont(undefined, 'normal');

  y += 5;
  pdf.setDrawColor(230);
  pdf.line(marginX, y, rightX, y);

  // Logo + company block (left)
  const logoY = y + 14;
  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, 'PNG', marginX, logoY - 8, 16, 16);
    } catch (e) {
      // fall back silently if the image fails to embed
    }
  }

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
  const hasTechnician = data.technicianName && data.technicianName !== '—';
  const hasTimeSlot = !!data.timeSlot;
  const boxHeight = 62 + (hasTechnician ? 6 : 0) + (hasTimeSlot ? 6 : 0);
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(marginX, boxTop, rightX - marginX, boxHeight, 3, 3, 'F');

  let leftY = boxTop + 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Invoice Details', marginX + 6, leftY);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  const details = [
    ['Job ID', data.jobId || '—'],
    [
      'Service',
      `${data.serviceName || '—'}${data.serviceType ? ` (${data.serviceType})` : ''}`,
    ],
    ['Date', data.bookingDate || '—'],
  ];
  if (hasTimeSlot) details.push(['Time Slot', data.timeSlot]);
  if (hasTechnician) details.push(['Technician', data.technicianName]);
  details.push(['Payment Method', formatMethodForPDF(data.paymentMethod)]);

  leftY += 7;
  details.forEach(([label, val]) => {
    pdf.setFont(undefined, 'bold');
    pdf.text(label, marginX + 6, leftY);
    pdf.setFont(undefined, 'normal');
    const wrapped = pdf.splitTextToSize(String(val), 55);
    pdf.text(wrapped, marginX + 45, leftY);
    leftY += 6 * wrapped.length;
  });

  // Billed to (right side of box)
  let rightY = boxTop + 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Billed to', rightX - 6, rightY, { align: 'right' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);
  rightY += 7;
  const billedName = data.name || data.customerName || '\u2014';
  const billedPhone = data.phone || data.customerPhone || '\u2014';
  const billedAddress = data.address || data.customerAddress || '\u2014';

  pdf.text(billedName, rightX - 6, rightY, { align: 'right' });
  rightY += 5;
  pdf.text(billedPhone, rightX - 6, rightY, { align: 'right' });
  rightY += 5;
  const addr = billedAddress;
  const addrWrapped = pdf.splitTextToSize(addr, 70);
  addrWrapped.forEach((line) => {
    pdf.text(line, rightX - 6, rightY, { align: 'right' });
    rightY += 5;
  });

  y = boxTop + boxHeight + 12;

  // Invoice Item(s) Details heading
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Invoice Item(s) Details', marginX, y);
  pdf.setFont(undefined, 'normal');
  y += 8;

  const cols = [
    { label: 'S.No', x: marginX + 2, w: 8 },
    { label: 'Particulars', x: marginX + 12, w: 100 },
    { label: 'Amount', x: rightX - 2, w: 24, align: 'right' },
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

  const rows = [
    {
      label: `Service: ${data.serviceName || '—'}`,
      value: Number(data.serviceCharge || 0),
    },
    ...taxLines.map((t) => ({ label: t.label, value: Number(t.value || 0) })),
  ];

  rows.forEach((row, idx) => {
    const rowTop = y;
    const particularLines = pdf.splitTextToSize(row.label, cols[1].w);

    pdf.setFontSize(8);
    pdf.text(String(idx + 1), cols[0].x, rowTop + 4);
    pdf.text(particularLines, cols[1].x, rowTop + 4);
    pdf.text(`Rs.${fmt(row.value)}`, cols[2].x, rowTop + 4, { align: 'right' });

    const rowHeight = Math.max(particularLines.length * 4.2 + 4, 14);
    pdf.setDrawColor(225);
    pdf.roundedRect(
      marginX,
      rowTop - 4,
      rightX - marginX,
      rowHeight,
      2,
      2,
      'S',
    );
    y = rowTop + rowHeight + 4;
  });

  y += 2;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Total Paid', marginX + 6, y);
  pdf.text(`Rs. ${fmt(data.totalPaid)}`, rightX - 2, y, { align: 'right' });
  pdf.setFont(undefined, 'normal');

  y += 10;
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text(
    'This is a system-generated document. No signature required.',
    marginX,
    y,
  );
  pdf.setTextColor(0, 0, 0);
}

function formatMethodForPDF(m) {
  if (m === 'upi') return 'UPI';
  if (m === 'card') return 'Card';
  if (m === 'netbanking') return 'Net Banking';
  return m || '—';
}

const PaymentBreakdown = ({ data }) => {
  const [open, setOpen] = useState(false);
  const taxLines = Array.isArray(data.taxLines) ? data.taxLines : [];
  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  return (
    <div>
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between mb-3"
      >
        <p className="text-[13px] font-semibold text-[#64748B] tracking-widest uppercase">
          Payment Breakdown
        </p>
        <span className="text-xs text-orange-500 font-medium">
          {open ? 'Hide ▲' : 'View details ▼'}
        </span>
      </button>

      <div className="space-y-2 text-[12px] text-gray-700">
        {/* Service charge — always visible */}
        <div className="flex justify-between">
          <span>Service Charge</span>
          <span className="text-black text-[13px] font-semibold">
            ₹{fmt(data.serviceCharge)}
          </span>
        </div>

        {/* Individual tax lines — visible when expanded */}
        {open && taxLines.length > 0 && (
          <div className="bg-slate-50 rounded-xl px-3 py-2 space-y-1.5 mt-1">
            {taxLines.map((t) => (
              <div key={t.label} className="flex justify-between text-[11px]">
                <span className="text-gray-500">{t.label}</span>
                <span className="text-gray-700 font-medium">
                  ₹{fmt(t.value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Collapsed tax summary */}
        {!open && taxLines.length > 0 && (
          <div className="flex justify-between">
            <span>Tax & Fees</span>
            <span className="text-black text-[13px] font-semibold">
              ₹{fmt(taxLines.reduce((s, t) => s + t.value, 0))}
            </span>
          </div>
        )}

        {taxLines.length === 0 && (
          <div className="flex justify-between">
            <span>Tax & Fees</span>
            <span className="text-black text-[13px] font-semibold">₹0</span>
          </div>
        )}

        <hr className="border-gray-100" />
        <div className="flex justify-between font-bold text-base">
          <span className="text-black">Total Paid</span>
          <span className="text-green-600">₹{fmt(data.totalPaid)}</span>
        </div>
      </div>
    </div>
  );
};

const ServiceReceiptModal = ({ data, onClose }) => {
  const receiptRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // const handleDownload = () => {
  //   // Simple print-to-PDF approach
  //   const printContent = receiptRef.current?.innerHTML;
  //   const win = window.open('', '_blank');
  //   win.document.write(`
  //     <html><head><title>Service Receipt</title>
  //     <style>
  //       body { font-family: sans-serif; padding: 24px; max-width: 400px; margin: 0 auto; }
  //       .green-header { background: #16a34a; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 16px; }
  //       .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  //       .divider { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
  //       .total { font-weight: bold; color: #16a34a; font-size: 15px; }
  //       .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  //       .badge { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 8px; padding: 8px 12px; font-size: 12px; display: flex; justify-content: space-between; }
  //     </style>
  //     </head><body>${printContent}</body></html>
  //   `);
  //   win.document.close();
  //   win.print();
  // };
  const handleDownload = async () => {
    const invoiceNo = `INV-${(data.jobId || 'SRV-0000').replace(/[^A-Za-z0-9-]/g, '')}`;
    let logoDataUrl = null;
    try {
      logoDataUrl = await loadImageAsDataUrl(RentnpayLogo.src);
    } catch (e) {
      // proceed without the logo if it fails to load
    }
    const pdf = new jsPDF();
    drawServiceInvoicePDF(pdf, data, logoDataUrl);
    pdf.save(`${invoiceNo}.pdf`);
  };
  const formatMethod = (m) => {
    if (m === 'upi') return 'UPI • ••••@paytm';
    if (m === 'card') return 'Card • •••• •••• ••••';
    if (m === 'netbanking') return 'Net Banking';
    return m;
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-sm max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Green Header */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 px-5 pt-5 pb-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-base">
                Service Receipt
              </span>
            </div>

            <p className="text-green-100 text-xs mt-1 ml-7">
              Thank you for using Rentnpay!
            </p>
          </div>
          <div className="mt-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm text-center">
            <p className="text-white/80 text-xs mb-1">Total Paid</p>

            <p className="text-white text-3xl font-bold">
              ₹{data.totalPaid?.toLocaleString('en-IN')}
            </p>

            <div className="mt-2 inline-flex items-center justify-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs px-3 py-1 rounded-full mx-auto">
              <CheckCircle2 className="w-3 h-3" />
              Payment Successful
            </div>
          </div>
        </div>

        {/* Body — pulls up over header */}
        <div
          ref={receiptRef}
          className="bg-white rounded-t-2xl -mt-4 px-5 pt-5 pb-2 overflow-y-auto flex-1 scrollbar-hide"
          style={{ boxShadow: 'inset 0 1px 0 #f3f4f6' }}
        >
          <div className="bg-[#F9FAFB] px-3 py-3 rounded-lg">
            {/* Service Details */}
            <p className="text-[13px] font-semibold text-[#64748B] tracking-widest uppercase mb-3">
              Service Details
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#64748B]">Job ID</p>
                  <p className="font-semibold text-gray-900">{data.jobId}</p>
                </div>
              </div>

              {/* <div className="flex items-start gap-2">
                <User2 className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#64748B]">Service</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {data.serviceName}
                  </p>
                </div>
              </div> */}
              <div className="flex items-start gap-2">
                <User2 className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#64748B]">Service</p>
                  <p className="font-semibold text-gray-900 capitalize flex items-center gap-2 flex-wrap">
                    {data.serviceName}
                    {data.serviceType ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 normal-case">
                        {data.serviceType}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              {data.technicianName && data.technicianName !== '—' && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#64748B]">Technician</p>
                    <p className="font-semibold text-gray-900">
                      {data.technicianName}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
                <div>
                  <p className="text-[10px] text-[#64748B]">Date</p>
                  <p className="font-semibold text-gray-900">
                    {data.bookingDate}
                  </p>
                </div>
              </div>

              {data.timeSlot && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#64748B] mt-2 shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#64748B]">Time</p>
                    <p className="font-semibold text-gray-900">
                      {data.timeSlot}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          {/* Payment Breakdown */}
          {/* <p className="text-[13px] font-semibold text-[#64748B] tracking-widest uppercase mb-3">
            Payment Breakdown
          </p>

          <div className="space-y-2 text-[12px] text-gray-700">
            <div className="flex justify-between">
              <span>Service Charge</span>
              <span className="text-black text-[13px] font-semibold">
                ₹{data.serviceCharge?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax & Fees</span>
              <span className="text-black text-[13px] font-semibold">
                ₹{(data.taxAndFees || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex justify-between font-bold text-base">
              <span className="text-black">Total Paid</span>
              <span className="text-green-600">
                ₹{data.totalPaid?.toLocaleString('en-IN')}
              </span>
            </div>
          </div> */}
          {/* Payment Breakdown */}
          <PaymentBreakdown data={data} />

          {/* Payment Method */}
          {/* <div className="mt-4 flex items-center justify-between bg-[#EFF6FF] border border-[#BEDBFF] rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#193CB8]">Payment Method</span>
            </div>
            <span className="text-xs font-semibold text-[#193CB8]">
              {formatMethod(data.paymentMethod)}
            </span>
          </div> */}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 space-y-2">
          <button
            onClick={handleDownload}
            className="w-full py-3 rounded-xl border-2 border-orange-400 text-orange-500 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </button>

          <p className="text-center text-[10px] text-[#64748B]">
            Need help? Contact support at{' '}
            <a
              href="mailto:support@rentnpay.com"
              className="text-[#193CB8] text-[13px] font-medium"
            >
              support@rentnpay.com
            </a>
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ServiceReceiptModal;
