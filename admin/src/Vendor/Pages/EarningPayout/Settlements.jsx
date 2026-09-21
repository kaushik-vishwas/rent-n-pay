// 'use client';

// import { useEffect, useMemo, useRef, useState } from 'react';
// import { useSelector } from 'react-redux';
// import {
//   Wallet,
//   Clock,
//   TrendingUp,
//   Info,
//   CheckCircle2,
//   Download,
//   Landmark,
//   BadgeCheck,
//   TrendingDown,
//   X,
//   Upload,
//   AlertTriangle,
//   Lock,
//   Shield,
//   Calendar,
// } from 'lucide-react';
// import jsPDF from 'jspdf';
// import {
//   apiGetVendorSettlements,
//   apiGetVendorBankDetails,
//   apiUpdateVendorBankDetails,
//   apiVendorSendBankChangeOtp,
//   apiVendorVerifyBankChangeOtp,
//   apiGetMyDefaultBankAccount,
// } from '@/service/api';
// import VendorSidebar from '../../Components/Common/VendorSidebar';
// import VendorTopBar from '../../Components/Common/VendorTopBar';

// const PERIOD_OPTIONS = [
//   { value: 'daily', label: 'Daily settlements', days: 1 },
//   { value: '3day', label: '3-day settlements', days: 3 },
//   { value: 'weekly', label: 'Weekly settlements', days: 7 },
//   { value: 'all', label: 'All settlements', days: null },
// ];

// const formatINR = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
// const formatINRForPDF = (amount) =>
//   `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

// /** Maps a raw Settlement doc (per-order) from the API into the shape this page renders. */
// function mapSettlement(s) {
//   const totalSales = Number(s.grossAmount || 0);
//   const platformFee = Number(s.platformFee || 0);
//   const netPayout = Number(s.netPayout || 0);
//   const status = s.status === 'Paid' ? 'Completed' : 'Processing';

//   // Settlement is per-order — use period if set, else the settlement's created date
//   const dateRange =
//     s.period && String(s.period).trim()
//       ? s.period
//       : s.createdAt
//         ? new Date(s.createdAt).toLocaleDateString('en-GB', {
//             day: 'numeric',
//             month: 'short',
//             year: 'numeric',
//           })
//         : '—';

//   const orderLabel = `ORD-${String(s?.orderId?.orderNumber ?? s?.orderNumber ?? 0).padStart(4, '0')}`;

//   return {
//     id: s._id,
//     settlementId: s._id ? `STL-${String(s._id).slice(-6).toUpperCase()}` : '—',
//     dateRange,
//     orderLabel,
//     totalSales,
//     platformFee,
//     netPayout,
//     status,
//     paidAt: s.paidAt || null,
//     transactionId: s.razorpayPayoutId || '',
//     createdAtRaw: s.createdAt || null,
//     statement: status === 'Completed',
//     raw: s,
//   };
// }

// /** Builds and downloads a detailed PDF statement for a single settlement row. */
// function downloadSettlementPDF(row, vendorUser) {
//   const s = row.raw || {};
//   const pdf = new jsPDF();
//   let y = 20;

//   pdf.setFontSize(18);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Settlement Statement', 14, y);
//   pdf.setFont(undefined, 'normal');

//   y += 10;
//   pdf.setFontSize(10);
//   pdf.setTextColor(120);
//   pdf.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 14, y);
//   pdf.setTextColor(0);

//   y += 12;
//   pdf.setDrawColor(220);
//   pdf.line(14, y, 196, y);

//   y += 10;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Vendor Details', 14, y);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(11);

//   y += 8;
//   pdf.text(
//     `Vendor Name: ${s.vendorName || vendorUser?.fullName || '—'}`,
//     14,
//     y,
//   );

//   y += 12;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Settlement Details', 14, y);

//   y += 8;
//   pdf.text(`Settlement ID: ${s._id || row.id || '—'}`, 14, y);
//   y += 7;
//   pdf.text(`Order ID: ${s.orderId || '—'}`, 14, y);
//   y += 7;
//   pdf.text(`Period: ${row.dateRange || '—'}`, 14, y);
//   y += 7;
//   pdf.text(`Status: ${row.status}`, 14, y);
//   y += 7;
//   pdf.text(
//     `Created At: ${
//       s.createdAt ? new Date(s.createdAt).toLocaleString('en-IN') : '—'
//     }`,
//     14,
//     y,
//   );
//   y += 7;
//   pdf.text(
//     `Paid At: ${row.paidAt ? new Date(row.paidAt).toLocaleString('en-IN') : 'Not yet paid'}`,
//     14,
//     y,
//   );
//   if (s.paidBy) {
//     y += 7;
//     pdf.text(`Paid By: ${s.paidBy}`, 14, y);
//   }

//   y += 12;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Amount Breakdown', 14, y);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(11);

//   y += 10;
//   pdf.setFillColor(245, 247, 250);
//   pdf.rect(14, y - 6, 182, 10, 'F');
//   pdf.text('Description', 18, y);
//   pdf.text('Amount', 178, y, { align: 'right' });

//   y += 10;
//   pdf.text('Gross Amount (Total Sales)', 18, y);
//   pdf.text(formatINRForPDF(row.totalSales), 178, y, { align: 'right' });

//   y += 8;
//   pdf.text('Platform Fee (10%)', 18, y);
//   pdf.setTextColor(200, 60, 60);
//   pdf.text(`- ${formatINRForPDF(row.platformFee)}`, 178, y, { align: 'right' });
//   pdf.setTextColor(0);

//   y += 4;
//   pdf.setDrawColor(220);
//   pdf.line(14, y, 196, y);

//   y += 8;
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Net Payout', 18, y);
//   pdf.setTextColor(16, 150, 100);
//   pdf.text(formatINRForPDF(row.netPayout), 178, y, { align: 'right' });

//   y += 16;
//   pdf.setFontSize(9);
//   pdf.setTextColor(140);
//   pdf.text(
//     'This is a system-generated statement. Platform fee is 10% of total sales.',
//     14,
//     y,
//   );

//   pdf.save(`settlement-${s.orderId || row.id || 'statement'}.pdf`);
// }

// /** Builds and downloads a consolidated PDF statement for all orders within a period/date-range group. */
// function downloadPeriodPDF(group, vendorUser) {
//   const pdf = new jsPDF();
//   let y = 20;

//   pdf.setFontSize(18);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Settlement Statement', 14, y);
//   pdf.setFont(undefined, 'normal');

//   y += 10;
//   pdf.setFontSize(10);
//   pdf.setTextColor(120);
//   pdf.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 14, y);
//   pdf.setTextColor(0);

//   y += 12;
//   pdf.setDrawColor(220);
//   pdf.line(14, y, 196, y);

//   y += 10;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Vendor Details', 14, y);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(11);

//   y += 8;
//   pdf.text(`Vendor Name: ${vendorUser?.fullName || '—'}`, 14, y);

//   y += 12;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Period Summary', 14, y);

//   y += 8;
//   pdf.text(`Date Range: ${group.dateRange || '—'}`, 14, y);
//   y += 7;
//   pdf.text(`Total Orders: ${group.orderCount}`, 14, y);
//   y += 7;
//   pdf.text(`Status: ${group.status}`, 14, y);

//   y += 12;
//   pdf.setFontSize(13);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Orders in this Period', 14, y);
//   pdf.setFont(undefined, 'normal');
//   pdf.setFontSize(9);

//   // y += 8;
//   // pdf.setFillColor(245, 247, 250);
//   // pdf.rect(14, y - 5, 182, 8, 'F');
//   // pdf.text('Order', 18, y);
//   // pdf.text('Business amount', 100, y);
//   // pdf.text('Deduction', 135, y);
//   // pdf.text('Net Payout', 178, y, { align: 'right' });

//   // y += 8;
//   // group.rows.forEach((row) => {
//   //   if (y > 275) {
//   //     pdf.addPage();
//   //     y = 20;
//   //   }
//   //   pdf.text(String(row.orderLabel), 18, y);
//   //   pdf.text(formatINRForPDF(row.totalSales), 100, y);
//   //   pdf.text(`- ${formatINRForPDF(row.platformFee)}`, 135, y);
//   //   pdf.text(formatINRForPDF(row.netPayout), 178, y, { align: 'right' });
//   //   y += 7;
//   // });

//   y += 8;
//   pdf.setFillColor(245, 247, 250);
//   pdf.rect(14, y - 5, 182, 8, 'F');
//   pdf.setFontSize(8);
//   pdf.text('Order', 16, y);
//   pdf.text('Business amount', 78, y);
//   pdf.text('Deduction', 110, y);
//   pdf.text('Net Payout', 138, y);
//   pdf.text('Transaction ID', 196, y, { align: 'right' });

//   y += 8;
//   group.rows.forEach((row) => {
//     if (y > 275) {
//       pdf.addPage();
//       y = 20;
//     }
//     pdf.text(String(row.orderLabel), 16, y);
//     pdf.text(formatINRForPDF(row.totalSales), 78, y);
//     pdf.text(`- ${formatINRForPDF(row.platformFee)}`, 110, y);
//     pdf.text(formatINRForPDF(row.netPayout), 138, y);
//     pdf.text(row.transactionId || '—', 196, y, { align: 'right' });
//     y += 7;
//   });
//   pdf.setFontSize(9);

//   y += 4;
//   pdf.setDrawColor(220);
//   pdf.line(14, y, 196, y);

//   y += 10;
//   pdf.setFontSize(11);
//   pdf.setFont(undefined, 'bold');
//   pdf.text('Total', 18, y);
//   pdf.text(formatINRForPDF(group.totalSales), 178, y, { align: 'right' });

//   y += 8;
//   pdf.text('Deduction', 18, y);
//   pdf.setTextColor(200, 60, 60);
//   pdf.text(`- ${formatINRForPDF(group.platformFee)}`, 178, y, {
//     align: 'right',
//   });
//   pdf.setTextColor(0);

//   y += 4;
//   pdf.line(14, y, 196, y);

//   y += 8;
//   pdf.text('Net Payout', 18, y);
//   pdf.setTextColor(16, 150, 100);
//   pdf.text(formatINRForPDF(group.netPayout), 178, y, { align: 'right' });
//   pdf.setTextColor(0);
//   pdf.setFont(undefined, 'normal');

//   y += 16;
//   pdf.setFontSize(9);
//   pdf.setTextColor(140);
//   pdf.text(
//     'This is a system-generated statement. Platform fee is 10% of total sales.',
//     14,
//     y,
//   );

//   pdf.save(
//     `settlement-${(group.dateRange || 'statement').replace(/\s+/g, '-')}.pdf`,
//   );
// }

// // const StatusBadge = ({ status }) => {
// //   if (status === 'Completed') {
// //     return (
// //       <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
// //         <CheckCircle2 className="h-3.5 w-3.5" />
// //         Completed
// //       </span>
// //     );
// //   }
// //   return (
// //     <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
// //       Processing
// //     </span>
// //   );
// // };

// const StatusBadge = ({ status }) => {
//   if (status === 'Completed') {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
//         <CheckCircle2 className="h-3.5 w-3.5" />
//         Completed
//       </span>
//     );
//   }
//   return (
//     <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
//       Processing
//     </span>
//   );
// };

// const BankStatusBadge = ({ status }) => {
//   const map = {
//     Verified: 'bg-emerald-500/20 text-emerald-300',
//     Pending: 'bg-amber-500/20 text-amber-300',
//     Rejected: 'bg-rose-500/20 text-rose-300',
//   };
//   return (
//     <span
//       className={`rounded-md px-2.5 py-1 text-xs font-medium ${
//         map[status] || 'bg-white/10 text-white/70'
//       }`}
//     >
//       {status || 'Pending'}
//     </span>
//   );
// };

// const VendorSettlements = () => {
//   const { user } = useSelector((state) => state.vendor);
//   const [rawSettlements, setRawSettlements] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [bankDetails, setBankDetails] = useState(null);
//   const [bankLoading, setBankLoading] = useState(true);
//   const [showBankModal, setShowBankModal] = useState(false);
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [bankOtp, setBankOtp] = useState('');
//   const [otpError, setOtpError] = useState('');
//   const [otpSending, setOtpSending] = useState(false);
//   const [otpVerifying, setOtpVerifying] = useState(false);
//   const otpInputRefs = useRef([]);

//   const handleOtpBoxChange = (index) => (e) => {
//     const digit = e.target.value.replace(/\D/g, '').slice(-1);
//     const otpArr = bankOtp.split('');
//     otpArr[index] = digit;
//     const newOtp = otpArr.join('').slice(0, 6);
//     setBankOtp(newOtp);
//     if (digit && index < 5) {
//       otpInputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleOtpBoxKeyDown = (index) => (e) => {
//     if (e.key === 'Backspace' && !bankOtp[index] && index > 0) {
//       otpInputRefs.current[index - 1]?.focus();
//     }
//     if (e.key === 'Enter') handleVerifyBankOtp();
//   };
//   const [bankForm, setBankForm] = useState({
//     accountHolderName: '',
//     accountNumber: '',
//     confirmAccountNumber: '',
//     ifscCode: '',
//     bankName: '',
//     chequeImage: null,
//   });
//   const [chequePreviewName, setChequePreviewName] = useState('');
//   const [bankFormError, setBankFormError] = useState('');
//   const [bankSubmitting, setBankSubmitting] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState({});

//   const validateBankForm = () => {
//     const errors = {};
//     const {
//       accountHolderName,
//       accountNumber,
//       confirmAccountNumber,
//       ifscCode,
//       bankName,
//     } = bankForm;

//     // Account Holder Name — letters/spaces only, min 3 chars
//     if (!accountHolderName.trim()) {
//       errors.accountHolderName = 'Account holder name is required.';
//     } else if (!/^[A-Za-z\s.]{3,50}$/.test(accountHolderName.trim())) {
//       errors.accountHolderName =
//         'Enter a valid name (letters only, min 3 characters).';
//     }

//     // Account Number — digits only, 9 to 18 digits (standard Indian bank range)
//     if (!accountNumber.trim()) {
//       errors.accountNumber = 'Account number is required.';
//     } else if (!/^\d{9,18}$/.test(accountNumber.trim())) {
//       errors.accountNumber = 'Account number must be 9–18 digits.';
//     }

//     // Confirm Account Number
//     if (!confirmAccountNumber.trim()) {
//       errors.confirmAccountNumber = 'Please re-enter the account number.';
//     } else if (accountNumber.trim() !== confirmAccountNumber.trim()) {
//       errors.confirmAccountNumber = 'Account numbers do not match.';
//     }

//     // IFSC Code — 4 letters + 0 + 6 alphanumeric (standard RBI format)
//     if (!ifscCode.trim()) {
//       errors.ifscCode = 'IFSC code is required.';
//     } else if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifscCode.trim())) {
//       errors.ifscCode = 'Enter a valid IFSC code (e.g., HDFC0001234).';
//     }

//     // Bank Name — letters/spaces only, min 2 chars
//     if (!bankName.trim()) {
//       errors.bankName = 'Bank name is required.';
//     } else if (!/^[A-Za-z\s.&-]{2,50}$/.test(bankName.trim())) {
//       errors.bankName = 'Enter a valid bank name.';
//     }

//     // Cheque image — required unless one already exists on file
//     // Cheque image — always required when submitting a new/changed bank account
//     if (!bankForm.chequeImage) {
//       errors.chequeImage = 'Please upload a cancelled cheque / passbook.';
//     } else {
//       const file = bankForm.chequeImage;
//       const allowedTypes = [
//         'application/pdf',
//         'image/jpeg',
//         'image/jpg',
//         'image/png',
//       ];
//       if (!allowedTypes.includes(file.type)) {
//         errors.chequeImage = 'Only PDF, JPG, or PNG files are allowed.';
//       } else if (file.size > 5 * 1024 * 1024) {
//         errors.chequeImage = 'File size must be under 5MB.';
//       }
//     }

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) {
//       setLoading(false);
//       return undefined;
//     }
//     let cancelled = false;
//     setLoading(true);
//     apiGetVendorSettlements(token)
//       .then((res) => {
//         if (cancelled) return;
//         setRawSettlements(
//           Array.isArray(res?.data?.settlements) ? res.data.settlements : [],
//         );
//       })
//       .catch(() => {
//         if (!cancelled) setRawSettlements([]);
//       })
//       .finally(() => {
//         if (!cancelled) setLoading(false);
//       });
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const fetchBankDetails = () => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) {
//       setBankLoading(false);
//       return;
//     }
//     setBankLoading(true);
//     apiGetMyDefaultBankAccount(token)
//       .then((res) => setBankDetails(res?.data?.bankDetails || null))
//       .catch(() => setBankDetails(null))
//       .finally(() => setBankLoading(false));
//   };

//   useEffect(() => {
//     fetchBankDetails();
//   }, []);

//   // const openBankModal = () => {
//   //   setBankForm({
//   //     accountHolderName: bankDetails?.accountHolderName || '',
//   //     accountNumber: '',
//   //     confirmAccountNumber: '',
//   //     ifscCode: '',
//   //     bankName: '',
//   //   });
//   //   setBankFormError('');
//   //   setShowBankModal(true);
//   // };

//   const openBankModal = () => {
//     setBankForm({
//       accountHolderName: bankDetails?.accountHolderName || '',
//       accountNumber: '',
//       confirmAccountNumber: '',
//       ifscCode: '',
//       bankName: '',
//       chequeImage: null,
//     });
//     setChequePreviewName('');
//     setBankFormError('');
//     setFieldErrors({});
//     setShowBankModal(true);
//   };

//   // Step 1: "Change Account" button → send OTP, open OTP modal
//   const startBankChange = async () => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) return;

//     setOtpError('');
//     setBankOtp('');
//     setOtpSending(true);
//     try {
//       await apiVendorSendBankChangeOtp(token);
//       setShowOtpModal(true);
//     } catch (err) {
//       setOtpError(
//         err?.response?.data?.message || 'Failed to send OTP. Try again.',
//       );
//       setShowOtpModal(true);
//     } finally {
//       setOtpSending(false);
//     }
//   };

//   // Step 2: OTP verified → close OTP modal, open bank details modal
//   const handleVerifyBankOtp = async () => {
//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) return;
//     if (bankOtp.length < 6) {
//       setOtpError('Enter the 6-digit OTP.');
//       return;
//     }

//     setOtpVerifying(true);
//     setOtpError('');
//     try {
//       await apiVendorVerifyBankChangeOtp(token, bankOtp);
//       setShowOtpModal(false);
//       openBankModal();
//     } catch (err) {
//       setOtpError(err?.response?.data?.message || 'Invalid or expired OTP.');
//     } finally {
//       setOtpVerifying(false);
//     }
//   };
//   const handleChequeFileChange = (e) => {
//     const file = e.target.files?.[0] || null;
//     setBankForm((prev) => ({ ...prev, chequeImage: file }));
//     setChequePreviewName(file ? file.name : '');
//     if (fieldErrors.chequeImage) {
//       setFieldErrors((prev) => ({ ...prev, chequeImage: '' }));
//     }
//   };

//   const handleBankFormChange = (field) => (e) => {
//     let value = e.target.value;
//     if (field === 'ifscCode') value = value.toUpperCase();
//     if (field === 'accountNumber' || field === 'confirmAccountNumber') {
//       value = value.replace(/\D/g, '');
//     }
//     setBankForm((prev) => ({ ...prev, [field]: value }));
//     if (fieldErrors[field]) {
//       setFieldErrors((prev) => ({ ...prev, [field]: '' }));
//     }
//   };

//   const handleBankFormSubmit = async (e) => {
//     e.preventDefault();
//     setBankFormError('');

//     if (!validateBankForm()) {
//       setBankFormError('Please fix the errors below.');
//       return;
//     }

//     const token =
//       typeof window !== 'undefined'
//         ? localStorage.getItem('vendorToken')
//         : null;
//     if (!token) {
//       setBankFormError('Session expired. Please log in again.');
//       return;
//     }

//     try {
//       setBankSubmitting(true);
//       await apiUpdateVendorBankDetails(token, {
//         accountHolderName: bankForm.accountHolderName,
//         accountNumber: bankForm.accountNumber,
//         ifscCode: bankForm.ifscCode,
//         bankName: bankForm.bankName,
//         chequeImage: bankForm.chequeImage,
//       });
//       setShowBankModal(false);
//       fetchBankDetails();
//     } catch (err) {
//       setBankFormError(
//         err?.response?.data?.message || 'Failed to save bank details.',
//       );
//     } finally {
//       setBankSubmitting(false);
//     }
//   };

//   const [periodFilter, setPeriodFilter] = useState('weekly'); // 'daily' | '3day' | 'weekly' | 'all'
//   const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const PAGE_SIZE = 15;

//   // useEffect(() => {
//   //   if (!periodMenuOpen) return undefined;
//   //   const close = (e) => {
//   //     const root = document.querySelector('[data-period-filter-menu]');
//   //     if (root && !root.contains(e.target)) setPeriodMenuOpen(false);
//   //   };
//   //   const onKey = (e) => {
//   //     if (e.key === 'Escape') setPeriodMenuOpen(false);
//   //   };
//   //   document.addEventListener('mousedown', close);
//   //   document.addEventListener('keydown', onKey);
//   //   return () => {
//   //     document.removeEventListener('mousedown', close);
//   //     document.removeEventListener('keydown', onKey);
//   //   };
//   // }, [periodMenuOpen]);

//   const settlements = useMemo(
//     () => rawSettlements.map(mapSettlement),
//     [rawSettlements],
//   );

//   const filteredSettlements = useMemo(() => {
//     const activeOption = PERIOD_OPTIONS.find((p) => p.value === periodFilter);
//     if (!activeOption || activeOption.days == null) return settlements;

//     const cutoff = Date.now() - activeOption.days * 24 * 60 * 60 * 1000;
//     return settlements.filter((row) => {
//       if (!row.createdAtRaw) return true;
//       return new Date(row.createdAtRaw).getTime() >= cutoff;
//     });
//   }, [settlements, periodFilter]);

//   const groupedSettlements = useMemo(() => {
//     const groups = new Map();
//     filteredSettlements.forEach((row) => {
//       const key = row.dateRange;
//       if (!groups.has(key)) {
//         groups.set(key, {
//           dateRange: key,
//           settlementId: '',
//           paidAt: null,
//           transactionId: '',
//           orderCount: 0,
//           totalSales: 0,
//           platformFee: 0,
//           netPayout: 0,
//           allCompleted: true,
//           rows: [],
//         });
//       }
//       const g = groups.get(key);
//       g.orderCount += 1;
//       g.totalSales += row.totalSales;
//       g.platformFee += row.platformFee;
//       g.netPayout += row.netPayout;
//       if (row.status !== 'Completed') g.allCompleted = false;
//       if (row.settlementId && !g.settlementId)
//         g.settlementId = row.settlementId;
//       if (row.paidAt && !g.paidAt) g.paidAt = row.paidAt;
//       if (row.transactionId && !g.transactionId)
//         g.transactionId = row.transactionId;
//       g.rows.push(row);
//     });
//     return Array.from(groups.values()).map((g) => ({
//       ...g,
//       status: g.allCompleted ? 'Completed' : 'Processing',
//     }));
//   }, [filteredSettlements]);

//   const totalPages = Math.max(
//     1,
//     Math.ceil(groupedSettlements.length / PAGE_SIZE),
//   );
//   const pagedSettlements = groupedSettlements.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE,
//   );

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [periodFilter, rawSettlements]);

//   const pendingClearance = useMemo(
//     () =>
//       rawSettlements
//         .filter((s) => s.status === 'Pending')
//         .reduce((sum, s) => sum + Number(s.netPayout || 0), 0),
//     [rawSettlements],
//   );

//   const totalEarnings = useMemo(
//     () =>
//       rawSettlements
//         .filter((s) => s.status === 'Paid')
//         .reduce((sum, s) => sum + Number(s.netPayout || 0), 0),
//     [rawSettlements],
//   );

//   const earningsGrowth = useMemo(() => {
//     const now = new Date();
//     const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

//     let thisMonthTotal = 0;
//     let lastMonthTotal = 0;

//     rawSettlements
//       .filter((s) => s.status === 'Paid' && s.createdAt)
//       .forEach((s) => {
//         const created = new Date(s.createdAt);
//         const amount = Number(s.netPayout || 0);
//         if (created >= startOfThisMonth) {
//           thisMonthTotal += amount;
//         } else if (created >= startOfLastMonth && created < startOfThisMonth) {
//           lastMonthTotal += amount;
//         }
//       });

//     if (lastMonthTotal === 0) {
//       return thisMonthTotal > 0 ? 100 : 0;
//     }
//     return Math.round(
//       ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100,
//     );
//   }, [rawSettlements]);

//   const [nextPayoutDate, setNextPayoutDate] = useState('');
//   useEffect(() => {
//     const pendingDates = rawSettlements
//       .filter((s) => s.status === 'Pending' && s.createdAt)
//       .map((s) => new Date(s.createdAt).getTime());
//     const base = pendingDates.length ? Math.min(...pendingDates) : Date.now();
//     const scheduled = new Date(base + 7 * 24 * 60 * 60 * 1000);
//     setNextPayoutDate(
//       scheduled.toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric',
//       }),
//     );
//   }, [rawSettlements]);

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* Sidebar */}
//       <VendorSidebar />

//       {/* Main Content */}
//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//         {/* Top Bar */}
//         <VendorTopBar user={user} />

//         {/* Page Content */}

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
//           {/* Header */}
//           {/* <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
//             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
//               <Wallet className="h-6 w-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">
//                 Earnings & Payouts
//               </h1>
//               <p className="mt-1 text-sm text-gray-500">
//                 Track your earnings, settlements, and payment schedules
//               </p>
//             </div>
//           </div> */}

//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
//             {/* Pending Clearance */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-6">
//               <div className="flex items-start justify-between">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-400">
//                   <Clock className="h-5 w-5 text-white" />
//                 </div>
//                 <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
//                   In Review
//                 </span>
//               </div>
//               <p className="mt-4 text-sm font-medium tracking-wide text-gray-500">
//                 PENDING CLEARANCE
//               </p>
//               <p className="mt-1 text-3xl font-bold text-gray-900">
//                 {formatINR(pendingClearance)}
//               </p>
//               <p className="mt-2 text-sm text-gray-500">
//                 Funds held for verification or pending delivery
//               </p>
//             </div>

//             {/* Next Payout */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-6">
//               <div className="flex items-start justify-between">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
//                   <Calendar className="h-5 w-5 text-white" />
//                 </div>
//                 <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
//                   {nextPayoutDate || '—'}
//                 </span>
//               </div>
//               <p className="mt-4 text-sm font-medium tracking-wide text-gray-500">
//                 NEXT PAYOUT
//               </p>
//               <p className="mt-1 text-3xl font-bold text-gray-900">
//                 {formatINR(pendingClearance)}
//               </p>
//               <p className="mt-2 text-sm text-gray-500">
//                 Scheduled for the next settlement cycle
//               </p>
//             </div>

//             {/* Total Earnings */}
//             <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
//               <div className="flex items-start justify-between">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500">
//                   <TrendingUp className="h-5 w-5 text-white" />
//                 </div>
//                 <span
//                   className={`flex items-center gap-1 text-sm font-semibold ${
//                     earningsGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
//                   }`}
//                 >
//                   {earningsGrowth >= 0 ? (
//                     <TrendingUp className="h-3.5 w-3.5" />
//                   ) : (
//                     <TrendingDown className="h-3.5 w-3.5" />
//                   )}
//                   {earningsGrowth >= 0 ? '+' : ''}
//                   {earningsGrowth}%
//                 </span>
//               </div>
//               <p className="mt-4 text-sm font-medium tracking-wide text-emerald-700">
//                 TOTAL EARNINGS
//               </p>
//               <p className="mt-1 text-3xl font-bold text-gray-900">
//                 {formatINR(totalEarnings)}
//               </p>
//               <p className="mt-2 text-sm text-gray-600">
//                 Lifetime earnings from all sales
//               </p>
//             </div>
//           </div>
//           {/* Settlement History */}
//           <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//             <div className="flex flex-col gap-3 p-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Settlement History
//                 </h2>
//                 <p className="mt-1 text-sm text-gray-500">
//                   Detailed breakdown of all your payouts
//                 </p>
//               </div>
//               <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
//                 <Info className="h-3.5 w-3.5" />
//                 {PERIOD_OPTIONS.find((p) => p.value === periodFilter)?.label}
//               </span>
//             </div>
//             <div className="w-full overflow-x-auto">
//               <table className="w-full min-w-[900px] text-sm">
//                 <thead>
//                   <tr className="border-t border-gray-100 text-left text-xs font-medium tracking-wide text-gray-500">
//                     <th className="whitespace-nowrap px-6 py-3 font-medium">
//                       SETTLEMENT ID
//                     </th>
//                     <th className="whitespace-nowrap px-6 py-3 font-medium">
//                       PAYOUT PERIOD
//                     </th>
//                     <th className="whitespace-nowrap px-6 py-3 font-medium">
//                       ORDER COUNT
//                     </th>
//                     <th className="whitespace-nowrap px-6 py-3 font-medium">
//                       BUSINESS AMOUNT
//                     </th>
//                     <th className="whitespace-nowrap px-6 py-3 font-medium">
//                       DEDUCTIONS
//                     </th>
//                     <th className="whitespace-nowrap px-6 py-3 font-medium text-emerald-600">
//                       NET PAYOUT
//                     </th>
//                     <th className="whitespace-nowrap px-6 py-3 font-medium">
//                       SETTLEMENT DATE
//                     </th>
//                     <th className="whitespace-nowrap px-6 py-3 font-medium">
//                       TRANSACTION ID
//                     </th>
//                     <th className="whitespace-nowrap px-6 py-3 font-medium">
//                       STATUS
//                     </th>
//                     <th className="whitespace-nowrap px-6 py-3 font-medium">
//                       ACTION
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td
//                         colSpan={10}
//                         className="whitespace-nowrap px-6 py-8 text-center text-gray-500"
//                       >
//                         Loading settlements…
//                       </td>
//                     </tr>
//                   ) : groupedSettlements.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={10}
//                         className="px-6 py-8 text-center text-gray-500"
//                       >
//                         No settlements yet.
//                       </td>
//                     </tr>
//                   ) : (
//                     pagedSettlements.map((group) => (
//                       <tr
//                         key={group.dateRange}
//                         className="border-t border-gray-100"
//                       >
//                         <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-700">
//                           {group.settlementId || '—'}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-4 text-gray-900">
//                           {group.dateRange}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-700">
//                           {group.orderCount} order
//                           {group.orderCount === 1 ? '' : 's'}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
//                           {formatINR(group.totalSales)}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-4 text-gray-400">
//                           -{formatINR(group.platformFee)}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-4">
//                           <span className="inline-flex rounded-lg border border-emerald-200 px-3 py-1 font-semibold text-emerald-600">
//                             {formatINR(group.netPayout)}
//                           </span>
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-4 text-gray-600">
//                           {group.paidAt
//                             ? new Date(group.paidAt).toLocaleDateString(
//                                 'en-IN',
//                                 {
//                                   day: '2-digit',
//                                   month: 'short',
//                                   year: 'numeric',
//                                 },
//                               )
//                             : '—'}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-600">
//                           {group.transactionId || '—'}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-4">
//                           <StatusBadge status={group.status} />
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-4">
//                           <button
//                             type="button"
//                             onClick={() => downloadPeriodPDF(group, user)}
//                             className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
//                           >
//                             <Download className="h-3.5 w-3.5" />
//                             PDF
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4 text-xs text-gray-500">
//               <Info className="h-3.5 w-3.5 shrink-0" />
//               Net payout is the amount transferred to your bank account after
//               deducting platform fees.
//             </div>
//             {!loading && groupedSettlements.length > 0 && (
//               <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm">
//                 <p className="text-gray-500">
//                   Showing {(currentPage - 1) * PAGE_SIZE + 1}-
//                   {Math.min(currentPage * PAGE_SIZE, groupedSettlements.length)}{' '}
//                   of {groupedSettlements.length}
//                 </p>
//                 <div className="flex items-center gap-2">
//                   <button
//                     type="button"
//                     disabled={currentPage === 1}
//                     onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                     className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50"
//                   >
//                     Prev
//                   </button>
//                   <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white">
//                     {currentPage}
//                   </span>
//                   <button
//                     type="button"
//                     disabled={currentPage === totalPages}
//                     onClick={() =>
//                       setCurrentPage((p) => Math.min(totalPages, p + 1))
//                     }
//                     className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Receiving Account */}
//           <div className="max-w-md">
//             <div className="bg-white rounded-2xl border border-gray-200 p-6">
//               <div className="flex items-center justify-between gap-2 mb-4">
//                 <div className="flex items-center gap-2">
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     Payout Account
//                   </h2>
//                 </div>
//               </div>

//               {bankLoading ? (
//                 <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
//                   Loading bank details…
//                 </div>
//               ) : bankDetails ? (
//                 // <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
//                 //   <div className="flex items-center justify-between">
//                 //     <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium">
//                 //       {bankDetails.bankName || 'Bank Account'}
//                 //     </span>
//                 //   </div>

//                 //   <p className="mt-6 text-xs text-white/60">Account Number</p>
//                 <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
//                   <div className="flex items-center justify-between">
//                     <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium">
//                       {bankDetails.bankName || 'Bank Account'}
//                     </span>
//                     <BankStatusBadge status={bankDetails.status} />
//                   </div>

//                   <p className="mt-6 text-xs text-white/60">Account Number</p>
//                   <p className="mt-1 text-lg font-mono tracking-widest">
//                     •••• •••• ••••{' '}
//                     {String(bankDetails.accountNumber || '').slice(-4)}
//                   </p>

//                   <div className="mt-5 flex items-end justify-between">
//                     <div>
//                       <p className="text-xs text-white/60">Account Holder</p>
//                       <p className="text-sm font-semibold">
//                         {bankDetails.accountHolderName}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-xs text-white/60">IFSC Code</p>
//                       <p className="text-sm font-semibold">
//                         {bankDetails.ifscCode}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
//                   No default bank account set. Add one from Settings → Bank.
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* {showBankModal ? (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
//             <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
//               <div>
//                 <h3 className="text-base font-semibold text-gray-900">
//                   Enter New Bank Details
//                 </h3>
//                 <p className="text-xs text-gray-500">Step 1 of 1</p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setShowBankModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <form onSubmit={handleBankFormSubmit} className="px-6 py-5"> */}
//       {showOtpModal ? (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
//             <div className="flex items-center justify-between px-7 py-6">
//               <div className="flex items-center gap-4">
//                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
//                   <Shield className="h-6 w-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900">
//                     Verify Identity
//                   </h3>
//                   <p className="text-sm text-gray-500">
//                     Security Check Required
//                   </p>
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setShowOtpModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="border-t border-gray-100 px-7 py-7 text-center">
//               <p className="text-[15px] text-gray-700">
//                 To update bank details, enter the OTP sent to your registered
//                 email
//               </p>

//               {otpError ? (
//                 <p className="mt-3 text-xs font-medium text-rose-600">
//                   {otpError}
//                 </p>
//               ) : null}

//               <div className="mt-6 flex justify-center gap-3">
//                 {[0, 1, 2, 3, 4, 5].map((i) => (
//                   <input
//                     key={i}
//                     ref={(el) => (otpInputRefs.current[i] = el)}
//                     type="text"
//                     inputMode="numeric"
//                     maxLength={1}
//                     value={bankOtp[i] || ''}
//                     onChange={handleOtpBoxChange(i)}
//                     onKeyDown={handleOtpBoxKeyDown(i)}
//                     className="h-14 w-12 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold text-gray-900 focus:border-blue-400 focus:outline-none"
//                   />
//                 ))}
//               </div>

//               <button
//                 type="button"
//                 onClick={startBankChange}
//                 disabled={otpSending}
//                 className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700"
//               >
//                 {otpSending ? 'Resending…' : "Didn't receive? Resend OTP"}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleVerifyBankOtp}
//                 disabled={otpVerifying || bankOtp.length < 6}
//                 className="mt-6 w-full rounded-xl bg-orange-500 py-3.5 text-base font-bold text-white hover:bg-orange-600 disabled:opacity-60"
//               >
//                 {otpVerifying ? 'Verifying…' : 'Verify & Proceed'}
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}
//       {showBankModal ? (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-xl">
//             <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
//               <div>
//                 <h3 className="text-base font-semibold text-gray-900">
//                   Enter New Bank Details
//                 </h3>
//                 <p className="text-xs text-gray-500">Step 2 of 2</p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setShowBankModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <form
//               onSubmit={handleBankFormSubmit}
//               className="overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
//             >
//               <div className="mb-4 flex items-start gap-2 rounded-lg border-2 border-[#FFD230] bg-[#FFFBEB] px-3 py-2.5 text-xs text-[#973C00]">
//                 <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
//                 Payouts will be paused until the new account is verified (24-48
//                 hrs).
//               </div>

//               {bankFormError ? (
//                 <p className="mb-3 text-xs font-medium text-rose-600">
//                   {bankFormError}
//                 </p>
//               ) : null}
//               <label className="mb-1 block text-xs font-medium text-gray-700">
//                 Account Holder Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={bankForm.accountHolderName}
//                 onChange={handleBankFormChange('accountHolderName')}
//                 placeholder="Must match PAN card"
//                 className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
//                   fieldErrors.accountHolderName
//                     ? 'border-rose-400 focus:border-rose-400'
//                     : 'border-gray-300 focus:border-blue-400'
//                 }`}
//               />
//               {fieldErrors.accountHolderName ? (
//                 <p className="mb-2 text-xs text-rose-600">
//                   {fieldErrors.accountHolderName}
//                 </p>
//               ) : (
//                 <div className="mb-3" />
//               )}

//               <label className="mb-1 block text-xs font-medium text-gray-700">
//                 New Account Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 inputMode="numeric"
//                 value={bankForm.accountNumber}
//                 onChange={handleBankFormChange('accountNumber')}
//                 placeholder="Enter account number"
//                 maxLength={18}
//                 className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
//                   fieldErrors.accountNumber
//                     ? 'border-rose-400 focus:border-rose-400'
//                     : 'border-gray-300 focus:border-blue-400'
//                 }`}
//               />
//               {fieldErrors.accountNumber ? (
//                 <p className="mb-2 text-xs text-rose-600">
//                   {fieldErrors.accountNumber}
//                 </p>
//               ) : (
//                 <div className="mb-3" />
//               )}

//               <label className="mb-1 block text-xs font-medium text-gray-700">
//                 Re-enter Account Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 inputMode="numeric"
//                 value={bankForm.confirmAccountNumber}
//                 onChange={handleBankFormChange('confirmAccountNumber')}
//                 placeholder="Confirm account number"
//                 maxLength={18}
//                 className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
//                   fieldErrors.confirmAccountNumber
//                     ? 'border-rose-400 focus:border-rose-400'
//                     : 'border-gray-300 focus:border-blue-400'
//                 }`}
//               />
//               {fieldErrors.confirmAccountNumber ? (
//                 <p className="mb-2 text-xs text-rose-600">
//                   {fieldErrors.confirmAccountNumber}
//                 </p>
//               ) : (
//                 <div className="mb-3" />
//               )}

//               <label className="mb-1 block text-xs font-medium text-gray-700">
//                 IFSC Code <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={bankForm.ifscCode}
//                 onChange={handleBankFormChange('ifscCode')}
//                 placeholder="E.G., HDFC0001234"
//                 maxLength={11}
//                 className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm uppercase focus:outline-none ${
//                   fieldErrors.ifscCode
//                     ? 'border-rose-400 focus:border-rose-400'
//                     : 'border-gray-300 focus:border-blue-400'
//                 }`}
//               />
//               {fieldErrors.ifscCode ? (
//                 <p className="mb-2 text-xs text-rose-600">
//                   {fieldErrors.ifscCode}
//                 </p>
//               ) : (
//                 <div className="mb-3" />
//               )}

//               {/* <label className="mb-1 block text-xs font-medium text-gray-700">
//                 Bank Name
//               </label>
//               <input
//                 type="text"
//                 value={bankForm.bankName}
//                 onChange={handleBankFormChange('bankName')}
//                 placeholder="E.G., HDFC Bank"
//                 className="mb-5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
//               />

//               <button
//                 type="submit"
//                 disabled={bankSubmitting}
//                 className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
//               >
//                 {bankSubmitting ? 'Submitting…' : 'Submit for Verification'}
//               </button>
//             </form> */}
//               <label className="mb-1 block text-xs font-medium text-gray-700">
//                 Bank Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={bankForm.bankName}
//                 onChange={handleBankFormChange('bankName')}
//                 placeholder="E.G., HDFC Bank"
//                 className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
//                   fieldErrors.bankName
//                     ? 'border-rose-400 focus:border-rose-400'
//                     : 'border-gray-300 focus:border-blue-400'
//                 }`}
//               />
//               {fieldErrors.bankName ? (
//                 <p className="mb-2 text-xs text-rose-600">
//                   {fieldErrors.bankName}
//                 </p>
//               ) : (
//                 <div className="mb-3" />
//               )}

//               <label className="mb-1 block text-xs font-medium text-gray-700">
//                 Cancelled Cheque / Passbook{' '}
//                 <span className="text-red-500">*</span>
//               </label>
//               <label
//                 htmlFor="chequeImageUpload"
//                 className={`mb-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-3 py-6 text-center hover:bg-gray-50 ${
//                   fieldErrors.chequeImage
//                     ? 'border-rose-400'
//                     : 'border-gray-300'
//                 }`}
//               >
//                 <Upload className="mb-2 h-5 w-5 text-gray-400" />
//                 <span className="text-sm font-medium text-gray-700">
//                   {chequePreviewName ? chequePreviewName : 'Click to upload'}
//                 </span>
//                 <span className="mt-1 text-xs text-gray-400">
//                   PDF, JPG, PNG (Max 5MB)
//                 </span>
//                 <input
//                   id="chequeImageUpload"
//                   type="file"
//                   accept=".pdf,.jpg,.jpeg,.png"
//                   onChange={handleChequeFileChange}
//                   className="hidden"
//                 />
//               </label>
//               {fieldErrors.chequeImage ? (
//                 <p className="mb-4 text-xs text-rose-600">
//                   {fieldErrors.chequeImage}
//                 </p>
//               ) : (
//                 <div className="mb-5" />
//               )}

//               <button
//                 type="submit"
//                 disabled={bankSubmitting}
//                 className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
//               >
//                 {bankSubmitting ? 'Submitting…' : 'Submit for Verification'}
//               </button>
//             </form>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// };

// export default VendorSettlements;

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Wallet,
  Clock,
  TrendingUp,
  Info,
  CheckCircle2,
  Download,
  Landmark,
  BadgeCheck,
  TrendingDown,
  X,
  Upload,
  AlertTriangle,
  Lock,
  Shield,
  Calendar,
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  apiGetVendorSettlements,
  apiGetVendorBankDetails,
  apiUpdateVendorBankDetails,
  apiVendorSendBankChangeOtp,
  apiVendorVerifyBankChangeOtp,
  apiGetMyDefaultBankAccount,
} from '@/service/api';
import VendorSidebar from '../../Components/Common/VendorSidebar';
import VendorTopBar from '../../Components/Common/VendorTopBar';

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Daily settlements', days: 1 },
  { value: '3day', label: '3-day settlements', days: 3 },
  { value: 'weekly', label: 'Weekly settlements', days: 7 },
  { value: 'all', label: 'All settlements', days: null },
];

const formatINR = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
const formatINRForPDF = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

/** Maps a raw Settlement doc (per-order) from the API into the shape this page renders. */
function mapSettlement(s) {
  // const baseRent = Number(s.grossAmount || 0);
  // const securityDeposit = Number(s.depositAmount || 0);
  // const totalSales = baseRent + securityDeposit;
  // const platformFee = Number(s.platformFee || 0);
  // const refundAmount = Number(s.refundAmount || 0);
  // const netPayout = Number(s.netPayout || 0);
  const baseRent = Number(s.grossAmount || 0);
  const securityDeposit = Number(s.depositAmount || 0);
  const totalSales = baseRent + securityDeposit;
  const platformFee = Number(s.platformFee || 0);
  const refundAmount = Number(s.refundAmount || 0);
  // Backend netPayout = (rent - platformFee) only; the security deposit
  // isn't a platform cut, it's just held and returned, so add it back in
  // here for display so vendors see the full amount that reaches their
  // bank account: (rent - fee) + deposit.
  const netPayout = Number(s.netPayout || 0) + securityDeposit;
  const status = s.status === 'Paid' ? 'Completed' : 'Processing';

  // Settlement is per-order — use period if set, else the settlement's created date
  const dateRange =
    s.period && String(s.period).trim()
      ? s.period
      : s.createdAt
        ? new Date(s.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '—';

  const orderLabel = `ORD-${String(s?.orderId?.orderNumber ?? s?.orderNumber ?? 0).padStart(4, '0')}`;

  // return {
  //   id: s._id,
  //   settlementId: s._id ? `STL-${String(s._id).slice(-6).toUpperCase()}` : '—',
  //   dateRange,
  return {
    id: s._id,
    settlementId: s.settlementId || '—',
    dateRange,
    orderLabel,
    totalSales,
    platformFee,
    refundAmount,
    netPayout,
    status,
    paidAt: s.paidAt || null,
    transactionId: s.razorpayPayoutId || '',
    createdAtRaw: s.createdAt || null,
    statement: status === 'Completed',
    raw: s,
  };
}

/** Builds and downloads a detailed PDF statement for a single settlement row. */
function downloadSettlementPDF(row, vendorUser) {
  const s = row.raw || {};
  const pdf = new jsPDF();
  let y = 20;

  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text('Settlement Statement', 14, y);
  pdf.setFont(undefined, 'normal');

  y += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(120);
  pdf.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 14, y);
  pdf.setTextColor(0);

  y += 12;
  pdf.setDrawColor(220);
  pdf.line(14, y, 196, y);

  y += 10;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Vendor Details', 14, y);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(11);

  y += 8;
  pdf.text(
    `Vendor Name: ${s.vendorName || vendorUser?.fullName || '—'}`,
    14,
    y,
  );

  y += 12;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Settlement Details', 14, y);

  y += 8;
  pdf.text(`Settlement ID: ${s._id || row.id || '—'}`, 14, y);
  y += 7;
  pdf.text(`Order ID: ${s.orderId || '—'}`, 14, y);
  y += 7;
  pdf.text(`Period: ${row.dateRange || '—'}`, 14, y);
  y += 7;
  pdf.text(`Status: ${row.status}`, 14, y);
  y += 7;
  pdf.text(
    `Created At: ${
      s.createdAt ? new Date(s.createdAt).toLocaleString('en-IN') : '—'
    }`,
    14,
    y,
  );
  y += 7;
  pdf.text(
    `Paid At: ${row.paidAt ? new Date(row.paidAt).toLocaleString('en-IN') : 'Not yet paid'}`,
    14,
    y,
  );
  if (s.paidBy) {
    y += 7;
    pdf.text(`Paid By: ${s.paidBy}`, 14, y);
  }

  y += 12;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Amount Breakdown', 14, y);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(11);

  y += 10;
  pdf.setFillColor(245, 247, 250);
  pdf.rect(14, y - 6, 182, 10, 'F');
  pdf.text('Description', 18, y);
  pdf.text('Amount', 178, y, { align: 'right' });

  y += 10;
  pdf.text('Gross Amount (Total Sales)', 18, y);
  pdf.text(formatINRForPDF(row.totalSales), 178, y, { align: 'right' });

  y += 8;
  pdf.text('Platform Fee (10%)', 18, y);
  pdf.setTextColor(200, 60, 60);
  pdf.text(`- ${formatINRForPDF(row.platformFee)}`, 178, y, { align: 'right' });
  pdf.setTextColor(0);

  y += 4;
  pdf.setDrawColor(220);
  pdf.line(14, y, 196, y);

  y += 8;
  pdf.setFont(undefined, 'bold');
  pdf.text('Net Payout', 18, y);
  pdf.setTextColor(16, 150, 100);
  pdf.text(formatINRForPDF(row.netPayout), 178, y, { align: 'right' });

  y += 16;
  pdf.setFontSize(9);
  pdf.setTextColor(140);
  pdf.text(
    'This is a system-generated statement. Platform fee is 10% of total sales.',
    14,
    y,
  );

  pdf.save(`settlement-${s.orderId || row.id || 'statement'}.pdf`);
}

/** Builds and downloads a consolidated PDF statement for all orders within a period/date-range group. */
function downloadPeriodPDF(group, vendorUser) {
  const pdf = new jsPDF();
  let y = 20;

  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text('Settlement Statement', 14, y);
  pdf.setFont(undefined, 'normal');

  y += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(120);
  pdf.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 14, y);
  pdf.setTextColor(0);

  y += 12;
  pdf.setDrawColor(220);
  pdf.line(14, y, 196, y);

  y += 10;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Vendor Details', 14, y);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(11);

  y += 8;
  pdf.text(`Vendor Name: ${vendorUser?.fullName || '—'}`, 14, y);

  y += 12;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Period Summary', 14, y);

  y += 8;
  pdf.text(`Date Range: ${group.dateRange || '—'}`, 14, y);
  y += 7;
  pdf.text(`Total Orders: ${group.orderCount}`, 14, y);
  y += 7;
  pdf.text(`Status: ${group.status}`, 14, y);

  y += 12;
  pdf.setFontSize(13);
  pdf.setFont(undefined, 'bold');
  pdf.text('Orders in this Period', 14, y);
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(9);

  // y += 8;
  // pdf.setFillColor(245, 247, 250);
  // pdf.rect(14, y - 5, 182, 8, 'F');
  // pdf.text('Order', 18, y);
  // pdf.text('Business amount', 100, y);
  // pdf.text('Deduction', 135, y);
  // pdf.text('Net Payout', 178, y, { align: 'right' });

  // y += 8;
  // group.rows.forEach((row) => {
  //   if (y > 275) {
  //     pdf.addPage();
  //     y = 20;
  //   }
  //   pdf.text(String(row.orderLabel), 18, y);
  //   pdf.text(formatINRForPDF(row.totalSales), 100, y);
  //   pdf.text(`- ${formatINRForPDF(row.platformFee)}`, 135, y);
  //   pdf.text(formatINRForPDF(row.netPayout), 178, y, { align: 'right' });
  //   y += 7;
  // });

  y += 8;
  pdf.setFillColor(245, 247, 250);
  pdf.rect(14, y - 5, 182, 8, 'F');
  pdf.setFontSize(8);
  pdf.text('Order', 16, y);
  pdf.text('Business amt', 58, y);
  pdf.text('Deduction', 86, y);
  pdf.text('Refund Ded.', 114, y);
  pdf.text('Net Payout', 146, y);
  pdf.text('Txn ID', 196, y, { align: 'right' });

  y += 8;
  group.rows.forEach((row) => {
    if (y > 275) {
      pdf.addPage();
      y = 20;
    }
    pdf.text(String(row.orderLabel), 16, y);
    pdf.text(formatINRForPDF(row.totalSales), 58, y);
    pdf.text(`- ${formatINRForPDF(row.platformFee)}`, 86, y);
    pdf.text(
      row.refundAmount > 0 ? `- ${formatINRForPDF(row.refundAmount)}` : '—',
      114,
      y,
    );
    pdf.text(formatINRForPDF(row.netPayout), 146, y);
    pdf.text(row.transactionId || '—', 196, y, { align: 'right' });
    y += 7;
  });
  pdf.setFontSize(9);

  y += 4;
  pdf.setDrawColor(220);
  pdf.line(14, y, 196, y);

  y += 10;
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.text('Total', 18, y);
  pdf.text(formatINRForPDF(group.totalSales), 178, y, { align: 'right' });

  y += 8;
  pdf.text('Deduction', 18, y);
  pdf.setTextColor(200, 60, 60);
  pdf.text(`- ${formatINRForPDF(group.platformFee)}`, 178, y, {
    align: 'right',
  });
  pdf.setTextColor(0);

  y += 4;
  pdf.line(14, y, 196, y);

  y += 8;
  pdf.text('Net Payout', 18, y);
  pdf.setTextColor(16, 150, 100);
  pdf.text(formatINRForPDF(group.netPayout), 178, y, { align: 'right' });
  pdf.setTextColor(0);
  pdf.setFont(undefined, 'normal');

  y += 16;
  pdf.setFontSize(9);
  pdf.setTextColor(140);
  pdf.text(
    'This is a system-generated statement. Platform fee is 10% of total sales.',
    14,
    y,
  );

  pdf.save(
    `settlement-${(group.dateRange || 'statement').replace(/\s+/g, '-')}.pdf`,
  );
}

// const StatusBadge = ({ status }) => {
//   if (status === 'Completed') {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
//         <CheckCircle2 className="h-3.5 w-3.5" />
//         Completed
//       </span>
//     );
//   }
//   return (
//     <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
//       Processing
//     </span>
//   );
// };

const StatusBadge = ({ status }) => {
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
      Processing
    </span>
  );
};

const BankStatusBadge = ({ status }) => {
  const map = {
    Verified: 'bg-emerald-500/20 text-emerald-300',
    Pending: 'bg-amber-500/20 text-amber-300',
    Rejected: 'bg-rose-500/20 text-rose-300',
  };
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
        map[status] || 'bg-white/10 text-white/70'
      }`}
    >
      {status || 'Pending'}
    </span>
  );
};

const VendorSettlements = () => {
  const { user } = useSelector((state) => state.vendor);
  const [rawSettlements, setRawSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bankDetails, setBankDetails] = useState(null);
  const [bankLoading, setBankLoading] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [bankOtp, setBankOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const otpInputRefs = useRef([]);

  const handleOtpBoxChange = (index) => (e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const otpArr = bankOtp.split('');
    otpArr[index] = digit;
    const newOtp = otpArr.join('').slice(0, 6);
    setBankOtp(newOtp);
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpBoxKeyDown = (index) => (e) => {
    if (e.key === 'Backspace' && !bankOtp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') handleVerifyBankOtp();
  };
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    chequeImage: null,
  });
  const [chequePreviewName, setChequePreviewName] = useState('');
  const [bankFormError, setBankFormError] = useState('');
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateBankForm = () => {
    const errors = {};
    const {
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      bankName,
    } = bankForm;

    // Account Holder Name — letters/spaces only, min 3 chars
    if (!accountHolderName.trim()) {
      errors.accountHolderName = 'Account holder name is required.';
    } else if (!/^[A-Za-z\s.]{3,50}$/.test(accountHolderName.trim())) {
      errors.accountHolderName =
        'Enter a valid name (letters only, min 3 characters).';
    }

    // Account Number — digits only, 9 to 18 digits (standard Indian bank range)
    if (!accountNumber.trim()) {
      errors.accountNumber = 'Account number is required.';
    } else if (!/^\d{9,18}$/.test(accountNumber.trim())) {
      errors.accountNumber = 'Account number must be 9–18 digits.';
    }

    // Confirm Account Number
    if (!confirmAccountNumber.trim()) {
      errors.confirmAccountNumber = 'Please re-enter the account number.';
    } else if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      errors.confirmAccountNumber = 'Account numbers do not match.';
    }

    // IFSC Code — 4 letters + 0 + 6 alphanumeric (standard RBI format)
    if (!ifscCode.trim()) {
      errors.ifscCode = 'IFSC code is required.';
    } else if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifscCode.trim())) {
      errors.ifscCode = 'Enter a valid IFSC code (e.g., HDFC0001234).';
    }

    // Bank Name — letters/spaces only, min 2 chars
    if (!bankName.trim()) {
      errors.bankName = 'Bank name is required.';
    } else if (!/^[A-Za-z\s.&-]{2,50}$/.test(bankName.trim())) {
      errors.bankName = 'Enter a valid bank name.';
    }

    // Cheque image — required unless one already exists on file
    // Cheque image — always required when submitting a new/changed bank account
    if (!bankForm.chequeImage) {
      errors.chequeImage = 'Please upload a cancelled cheque / passbook.';
    } else {
      const file = bankForm.chequeImage;
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ];
      if (!allowedTypes.includes(file.type)) {
        errors.chequeImage = 'Only PDF, JPG, or PNG files are allowed.';
      } else if (file.size > 5 * 1024 * 1024) {
        errors.chequeImage = 'File size must be under 5MB.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    apiGetVendorSettlements(token)
      .then((res) => {
        if (cancelled) return;
        setRawSettlements(
          Array.isArray(res?.data?.settlements) ? res.data.settlements : [],
        );
      })
      .catch(() => {
        if (!cancelled) setRawSettlements([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchBankDetails = () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) {
      setBankLoading(false);
      return;
    }
    setBankLoading(true);
    apiGetMyDefaultBankAccount(token)
      .then((res) => setBankDetails(res?.data?.bankDetails || null))
      .catch(() => setBankDetails(null))
      .finally(() => setBankLoading(false));
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  // const openBankModal = () => {
  //   setBankForm({
  //     accountHolderName: bankDetails?.accountHolderName || '',
  //     accountNumber: '',
  //     confirmAccountNumber: '',
  //     ifscCode: '',
  //     bankName: '',
  //   });
  //   setBankFormError('');
  //   setShowBankModal(true);
  // };

  const openBankModal = () => {
    setBankForm({
      accountHolderName: bankDetails?.accountHolderName || '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
      chequeImage: null,
    });
    setChequePreviewName('');
    setBankFormError('');
    setFieldErrors({});
    setShowBankModal(true);
  };

  // Step 1: "Change Account" button → send OTP, open OTP modal
  const startBankChange = async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) return;

    setOtpError('');
    setBankOtp('');
    setOtpSending(true);
    try {
      await apiVendorSendBankChangeOtp(token);
      setShowOtpModal(true);
    } catch (err) {
      setOtpError(
        err?.response?.data?.message || 'Failed to send OTP. Try again.',
      );
      setShowOtpModal(true);
    } finally {
      setOtpSending(false);
    }
  };

  // Step 2: OTP verified → close OTP modal, open bank details modal
  const handleVerifyBankOtp = async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) return;
    if (bankOtp.length < 6) {
      setOtpError('Enter the 6-digit OTP.');
      return;
    }

    setOtpVerifying(true);
    setOtpError('');
    try {
      await apiVendorVerifyBankChangeOtp(token, bankOtp);
      setShowOtpModal(false);
      openBankModal();
    } catch (err) {
      setOtpError(err?.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setOtpVerifying(false);
    }
  };
  const handleChequeFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setBankForm((prev) => ({ ...prev, chequeImage: file }));
    setChequePreviewName(file ? file.name : '');
    if (fieldErrors.chequeImage) {
      setFieldErrors((prev) => ({ ...prev, chequeImage: '' }));
    }
  };

  const handleBankFormChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'ifscCode') value = value.toUpperCase();
    if (field === 'accountNumber' || field === 'confirmAccountNumber') {
      value = value.replace(/\D/g, '');
    }
    setBankForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBankFormSubmit = async (e) => {
    e.preventDefault();
    setBankFormError('');

    if (!validateBankForm()) {
      setBankFormError('Please fix the errors below.');
      return;
    }

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendorToken')
        : null;
    if (!token) {
      setBankFormError('Session expired. Please log in again.');
      return;
    }

    try {
      setBankSubmitting(true);
      await apiUpdateVendorBankDetails(token, {
        accountHolderName: bankForm.accountHolderName,
        accountNumber: bankForm.accountNumber,
        ifscCode: bankForm.ifscCode,
        bankName: bankForm.bankName,
        chequeImage: bankForm.chequeImage,
      });
      setShowBankModal(false);
      fetchBankDetails();
    } catch (err) {
      setBankFormError(
        err?.response?.data?.message || 'Failed to save bank details.',
      );
    } finally {
      setBankSubmitting(false);
    }
  };

  const [periodFilter, setPeriodFilter] = useState('weekly'); // 'daily' | '3day' | 'weekly' | 'all'
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // useEffect(() => {
  //   if (!periodMenuOpen) return undefined;
  //   const close = (e) => {
  //     const root = document.querySelector('[data-period-filter-menu]');
  //     if (root && !root.contains(e.target)) setPeriodMenuOpen(false);
  //   };
  //   const onKey = (e) => {
  //     if (e.key === 'Escape') setPeriodMenuOpen(false);
  //   };
  //   document.addEventListener('mousedown', close);
  //   document.addEventListener('keydown', onKey);
  //   return () => {
  //     document.removeEventListener('mousedown', close);
  //     document.removeEventListener('keydown', onKey);
  //   };
  // }, [periodMenuOpen]);

  const settlements = useMemo(
    () => rawSettlements.map(mapSettlement),
    [rawSettlements],
  );

  const filteredSettlements = useMemo(() => {
    const activeOption = PERIOD_OPTIONS.find((p) => p.value === periodFilter);
    if (!activeOption || activeOption.days == null) return settlements;

    const cutoff = Date.now() - activeOption.days * 24 * 60 * 60 * 1000;
    return settlements.filter((row) => {
      if (!row.createdAtRaw) return true;
      return new Date(row.createdAtRaw).getTime() >= cutoff;
    });
  }, [settlements, periodFilter]);

  const groupedSettlements = useMemo(() => {
    const groups = new Map();
    filteredSettlements.forEach((row) => {
      const key = row.dateRange;
      if (!groups.has(key)) {
        groups.set(key, {
          dateRange: key,
          settlementId: '',
          paidAt: null,
          transactionId: '',
          orderCount: 0,
          totalSales: 0,
          platformFee: 0,
          netPayout: 0,
          allCompleted: true,
          rows: [],
        });
      }
      const g = groups.get(key);
      g.orderCount += 1;
      g.totalSales += row.totalSales;
      g.platformFee += row.platformFee;
      g.refundAmount = (g.refundAmount || 0) + (row.refundAmount || 0);
      g.netPayout += row.netPayout;
      if (row.status !== 'Completed') g.allCompleted = false;
      if (row.settlementId && !g.settlementId)
        g.settlementId = row.settlementId;
      if (row.paidAt && !g.paidAt) g.paidAt = row.paidAt;
      if (row.transactionId && !g.transactionId)
        g.transactionId = row.transactionId;
      g.rows.push(row);
    });
    return Array.from(groups.values()).map((g) => ({
      ...g,
      status: g.allCompleted ? 'Completed' : 'Processing',
    }));
  }, [filteredSettlements]);

  const totalPages = Math.max(
    1,
    Math.ceil(groupedSettlements.length / PAGE_SIZE),
  );
  const pagedSettlements = groupedSettlements.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [periodFilter, rawSettlements]);

  // Backend netPayout = (rent - fee) only; add the deposit back in so these
  // cards reflect the full amount reaching the vendor's bank account.
  const pendingClearance = useMemo(
    () =>
      rawSettlements
        .filter((s) => s.status === 'Pending')
        .reduce(
          (sum, s) =>
            sum + Number(s.netPayout || 0) + Number(s.depositAmount || 0),
          0,
        ),
    [rawSettlements],
  );

  const totalEarnings = useMemo(
    () =>
      rawSettlements
        .filter((s) => s.status === 'Paid')
        .reduce(
          (sum, s) =>
            sum + Number(s.netPayout || 0) + Number(s.depositAmount || 0),
          0,
        ),
    [rawSettlements],
  );

  const earningsGrowth = useMemo(() => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let thisMonthTotal = 0;
    let lastMonthTotal = 0;

    rawSettlements
      .filter((s) => s.status === 'Paid' && s.createdAt)
      .forEach((s) => {
        const created = new Date(s.createdAt);
        const amount = Number(s.netPayout || 0);
        if (created >= startOfThisMonth) {
          thisMonthTotal += amount;
        } else if (created >= startOfLastMonth && created < startOfThisMonth) {
          lastMonthTotal += amount;
        }
      });

    if (lastMonthTotal === 0) {
      return thisMonthTotal > 0 ? 100 : 0;
    }
    return Math.round(
      ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100,
    );
  }, [rawSettlements]);

  const [nextPayoutDate, setNextPayoutDate] = useState('');
  useEffect(() => {
    const pendingDates = rawSettlements
      .filter((s) => s.status === 'Pending' && s.createdAt)
      .map((s) => new Date(s.createdAt).getTime());
    const base = pendingDates.length ? Math.min(...pendingDates) : Date.now();
    const scheduled = new Date(base + 7 * 24 * 60 * 60 * 1000);
    setNextPayoutDate(
      scheduled.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    );
  }, [rawSettlements]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <VendorSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Bar */}
        <VendorTopBar user={user} />

        {/* Page Content */}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          {/* <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Earnings & Payouts
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track your earnings, settlements, and payment schedules
              </p>
            </div>
          </div> */}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Pending Clearance */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-400">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  In Review
                </span>
              </div>
              <p className="mt-4 text-sm font-medium tracking-wide text-gray-500">
                PENDING CLEARANCE
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {formatINR(pendingClearance)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Funds held for verification or pending delivery
              </p>
            </div>

            {/* Next Payout */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {nextPayoutDate || '—'}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium tracking-wide text-gray-500">
                NEXT PAYOUT
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {formatINR(pendingClearance)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Scheduled for the next settlement cycle
              </p>
            </div>

            {/* Total Earnings */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    earningsGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {earningsGrowth >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {earningsGrowth >= 0 ? '+' : ''}
                  {earningsGrowth}%
                </span>
              </div>
              <p className="mt-4 text-sm font-medium tracking-wide text-emerald-700">
                TOTAL EARNINGS
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {formatINR(totalEarnings)}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Lifetime earnings from all sales
              </p>
            </div>
          </div>
          {/* Settlement History */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex flex-col gap-3 p-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Settlement History
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Detailed breakdown of all your payouts
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                <Info className="h-3.5 w-3.5" />
                {PERIOD_OPTIONS.find((p) => p.value === periodFilter)?.label}
              </span>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-t border-gray-100 text-left text-xs font-medium tracking-wide text-gray-500">
                    <th className="whitespace-nowrap px-6 py-3 font-medium">
                      SETTLEMENT ID
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium">
                      PAYOUT PERIOD
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium">
                      ORDER COUNT
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium">
                      BUSINESS AMOUNT
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium">
                      DEDUCTIONS
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium">
                      REFUND DEDUCTION
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium text-emerald-600">
                      NET PAYOUT
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium">
                      SETTLEMENT DATE
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium">
                      TRANSACTION ID
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium">
                      STATUS
                    </th>
                    <th className="whitespace-nowrap px-6 py-3 font-medium">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="whitespace-nowrap px-6 py-8 text-center text-gray-500"
                      >
                        Loading settlements…
                      </td>
                    </tr>
                  ) : groupedSettlements.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No settlements yet.
                      </td>
                    </tr>
                  ) : (
                    pagedSettlements.map((group) => (
                      <tr
                        key={group.dateRange}
                        className="border-t border-gray-100"
                      >
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-700">
                          {group.settlementId || '—'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                          {group.dateRange}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-700">
                          {group.orderCount} order
                          {group.orderCount === 1 ? '' : 's'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                          {formatINR(group.totalSales)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-400">
                          -{formatINR(group.platformFee)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-400">
                          {group.refundAmount > 0
                            ? `-${formatINR(group.refundAmount)}`
                            : '—'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex rounded-lg border border-emerald-200 px-3 py-1 font-semibold text-emerald-600">
                            {formatINR(group.netPayout)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                          {group.paidAt
                            ? new Date(group.paidAt).toLocaleDateString(
                                'en-IN',
                                {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                },
                              )
                            : '—'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-600">
                          {group.transactionId || '—'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge status={group.status} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <button
                            type="button"
                            onClick={() => downloadPeriodPDF(group, user)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4 text-xs text-gray-500">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Net payout is the amount transferred to your bank account.
            </div>
            {!loading && groupedSettlements.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm">
                <p className="text-gray-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(currentPage * PAGE_SIZE, groupedSettlements.length)}{' '}
                  of {groupedSettlements.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white">
                    {currentPage}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Receiving Account */}
          <div className="max-w-md">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payout Account
                  </h2>
                </div>
              </div>

              {bankLoading ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
                  Loading bank details…
                </div>
              ) : bankDetails ? (
                // <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
                //   <div className="flex items-center justify-between">
                //     <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium">
                //       {bankDetails.bankName || 'Bank Account'}
                //     </span>
                //   </div>

                //   <p className="mt-6 text-xs text-white/60">Account Number</p>
                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium">
                      {bankDetails.bankName || 'Bank Account'}
                    </span>
                    <BankStatusBadge status={bankDetails.status} />
                  </div>

                  {/* <p className="mt-6 text-xs text-white/60">Account Number</p>
                  <p className="mt-1 text-lg font-mono tracking-widest">
                    •••• •••• ••••{' '}
                    {String(bankDetails.accountNumber || '').slice(-4)}
                  </p> */}
                  <p className="mt-6 text-xs text-white/60">Account Number</p>
                  <p className="mt-1 text-lg font-mono tracking-widest">
                    {String(bankDetails.accountNumber || '')
                      .replace(/\D/g, '')
                      .replace(/(.{4})/g, '$1 ')
                      .trim()}
                  </p>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-white/60">Account Holder</p>
                      <p className="text-sm font-semibold">
                        {bankDetails.accountHolderName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60">IFSC Code</p>
                      <p className="text-sm font-semibold">
                        {bankDetails.ifscCode}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                  No default bank account set. Add one from Settings → Bank.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* {showBankModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Enter New Bank Details
                </h3>
                <p className="text-xs text-gray-500">Step 1 of 1</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBankFormSubmit} className="px-6 py-5"> */}
      {showOtpModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-7 py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Verify Identity
                  </h3>
                  <p className="text-sm text-gray-500">
                    Security Check Required
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-t border-gray-100 px-7 py-7 text-center">
              <p className="text-[15px] text-gray-700">
                To update bank details, enter the OTP sent to your registered
                email
              </p>

              {otpError ? (
                <p className="mt-3 text-xs font-medium text-rose-600">
                  {otpError}
                </p>
              ) : null}

              <div className="mt-6 flex justify-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    ref={(el) => (otpInputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={bankOtp[i] || ''}
                    onChange={handleOtpBoxChange(i)}
                    onKeyDown={handleOtpBoxKeyDown(i)}
                    className="h-14 w-12 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold text-gray-900 focus:border-blue-400 focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={startBankChange}
                disabled={otpSending}
                className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {otpSending ? 'Resending…' : "Didn't receive? Resend OTP"}
              </button>

              <button
                type="button"
                onClick={handleVerifyBankOtp}
                disabled={otpVerifying || bankOtp.length < 6}
                className="mt-6 w-full rounded-xl bg-orange-500 py-3.5 text-base font-bold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {otpVerifying ? 'Verifying…' : 'Verify & Proceed'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showBankModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Enter New Bank Details
                </h3>
                <p className="text-xs text-gray-500">Step 2 of 2</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleBankFormSubmit}
              className="overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="mb-4 flex items-start gap-2 rounded-lg border-2 border-[#FFD230] bg-[#FFFBEB] px-3 py-2.5 text-xs text-[#973C00]">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Payouts will be paused until the new account is verified (24-48
                hrs).
              </div>

              {bankFormError ? (
                <p className="mb-3 text-xs font-medium text-rose-600">
                  {bankFormError}
                </p>
              ) : null}
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Account Holder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bankForm.accountHolderName}
                onChange={handleBankFormChange('accountHolderName')}
                placeholder="Must match PAN card"
                className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  fieldErrors.accountHolderName
                    ? 'border-rose-400 focus:border-rose-400'
                    : 'border-gray-300 focus:border-blue-400'
                }`}
              />
              {fieldErrors.accountHolderName ? (
                <p className="mb-2 text-xs text-rose-600">
                  {fieldErrors.accountHolderName}
                </p>
              ) : (
                <div className="mb-3" />
              )}

              <label className="mb-1 block text-xs font-medium text-gray-700">
                New Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={bankForm.accountNumber}
                onChange={handleBankFormChange('accountNumber')}
                placeholder="Enter account number"
                maxLength={18}
                className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  fieldErrors.accountNumber
                    ? 'border-rose-400 focus:border-rose-400'
                    : 'border-gray-300 focus:border-blue-400'
                }`}
              />
              {fieldErrors.accountNumber ? (
                <p className="mb-2 text-xs text-rose-600">
                  {fieldErrors.accountNumber}
                </p>
              ) : (
                <div className="mb-3" />
              )}

              <label className="mb-1 block text-xs font-medium text-gray-700">
                Re-enter Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={bankForm.confirmAccountNumber}
                onChange={handleBankFormChange('confirmAccountNumber')}
                placeholder="Confirm account number"
                maxLength={18}
                className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  fieldErrors.confirmAccountNumber
                    ? 'border-rose-400 focus:border-rose-400'
                    : 'border-gray-300 focus:border-blue-400'
                }`}
              />
              {fieldErrors.confirmAccountNumber ? (
                <p className="mb-2 text-xs text-rose-600">
                  {fieldErrors.confirmAccountNumber}
                </p>
              ) : (
                <div className="mb-3" />
              )}

              <label className="mb-1 block text-xs font-medium text-gray-700">
                IFSC Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bankForm.ifscCode}
                onChange={handleBankFormChange('ifscCode')}
                placeholder="E.G., HDFC0001234"
                maxLength={11}
                className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm uppercase focus:outline-none ${
                  fieldErrors.ifscCode
                    ? 'border-rose-400 focus:border-rose-400'
                    : 'border-gray-300 focus:border-blue-400'
                }`}
              />
              {fieldErrors.ifscCode ? (
                <p className="mb-2 text-xs text-rose-600">
                  {fieldErrors.ifscCode}
                </p>
              ) : (
                <div className="mb-3" />
              )}

              {/* <label className="mb-1 block text-xs font-medium text-gray-700">
                Bank Name
              </label>
              <input
                type="text"
                value={bankForm.bankName}
                onChange={handleBankFormChange('bankName')}
                placeholder="E.G., HDFC Bank"
                className="mb-5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              />

              <button
                type="submit"
                disabled={bankSubmitting}
                className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {bankSubmitting ? 'Submitting…' : 'Submit for Verification'}
              </button>
            </form> */}
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bankForm.bankName}
                onChange={handleBankFormChange('bankName')}
                placeholder="E.G., HDFC Bank"
                className={`mb-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  fieldErrors.bankName
                    ? 'border-rose-400 focus:border-rose-400'
                    : 'border-gray-300 focus:border-blue-400'
                }`}
              />
              {fieldErrors.bankName ? (
                <p className="mb-2 text-xs text-rose-600">
                  {fieldErrors.bankName}
                </p>
              ) : (
                <div className="mb-3" />
              )}

              <label className="mb-1 block text-xs font-medium text-gray-700">
                Cancelled Cheque / Passbook{' '}
                <span className="text-red-500">*</span>
              </label>
              <label
                htmlFor="chequeImageUpload"
                className={`mb-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-3 py-6 text-center hover:bg-gray-50 ${
                  fieldErrors.chequeImage
                    ? 'border-rose-400'
                    : 'border-gray-300'
                }`}
              >
                <Upload className="mb-2 h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {chequePreviewName ? chequePreviewName : 'Click to upload'}
                </span>
                <span className="mt-1 text-xs text-gray-400">
                  PDF, JPG, PNG (Max 5MB)
                </span>
                <input
                  id="chequeImageUpload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleChequeFileChange}
                  className="hidden"
                />
              </label>
              {fieldErrors.chequeImage ? (
                <p className="mb-4 text-xs text-rose-600">
                  {fieldErrors.chequeImage}
                </p>
              ) : (
                <div className="mb-5" />
              )}

              <button
                type="submit"
                disabled={bankSubmitting}
                className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {bankSubmitting ? 'Submitting…' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VendorSettlements;
