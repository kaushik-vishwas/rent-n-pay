// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import VendorSidebar from '../../Components/Common/VendorSidebar';
// import VendorTopBar from '../../Components/Common/VendorTopBar';
// import {
//   apiGetMyKycSettings,
//   apiGetMyVendorProfile,
//   apiGetMyBankAccounts,
//   apiAddBankAccount,
//   apiUpdateBankAccount,
//   apiDeleteBankAccount,
//   apiUpdateMyKycBankDetails,
// } from '@/service/api';
// import {
//   User,
//   Briefcase,
//   Landmark,
//   IdCard,
//   ShieldCheck,
//   Plus,
//   Pencil,
//   Trash2,
//   X,
//   Eye,
// } from 'lucide-react';
// import { toast } from 'react-toastify';

// const TABS = [
//   { key: 'account', label: 'Overview' },
//   { key: 'business', label: 'Business' },
//   // { key: 'stores', label: 'Stores' },
//   { key: 'kycBank', label: 'Bank' },
//   // { key: 'bank', label: 'Bank' },
//   { key: 'kyc', label: 'KYC Status' },
// ];
// const StatusBadge = ({ status }) => {
//   const map = {
//     approved: 'bg-green-100 text-green-700',
//     pending: 'bg-yellow-100 text-yellow-700',
//     rejected: 'bg-red-100 text-red-700',
//     draft: 'bg-gray-100 text-gray-600',
//     Verified: 'bg-green-100 text-green-700',
//     Pending: 'bg-yellow-100 text-yellow-700',
//     Rejected: 'bg-red-100 text-red-700',
//     'Not Added': 'bg-gray-100 text-gray-600',
//   };
//   return (
//     <span
//       className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${
//         map[status] || 'bg-gray-100 text-gray-600'
//       }`}
//     >
//       {status || 'Unknown'}
//     </span>
//   );
// };

// const Field = ({ label, value }) => (
//   <div className="min-w-0">
//     <p className="text-xs font-medium text-gray-500">{label}</p>
//     <p className="truncate text-sm font-medium text-gray-800">{value || '—'}</p>
//   </div>
// );
// const Card = ({ title, icon: Icon, action, children }) => (
//   <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
//     <div className="mb-4 flex items-center justify-between">
//       <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800 sm:text-lg">
//         {Icon && <Icon className="h-5 w-5 text-gray-500" />}
//         {title}
//       </h2>
//       {action}
//     </div>
//     {children}
//   </div>
// );

// const Skeleton = () => (
//   <div className="space-y-4 animate-pulse">
//     <div className="h-24 rounded-xl bg-gray-200" />
//     <div className="h-40 rounded-xl bg-gray-200" />
//     <div className="h-40 rounded-xl bg-gray-200" />
//   </div>
// );

// const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// const Settings = () => {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('account');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [vendor, setVendor] = useState(null);
//   const [kyc, setKyc] = useState(null);
//   const [bankAccounts, setBankAccounts] = useState([]);
//   const [isBankModalOpen, setIsBankModalOpen] = useState(false);
//   const [editingBankId, setEditingBankId] = useState(null);
//   const [bankSaving, setBankSaving] = useState(false);
//   const [bankForm, setBankForm] = useState({
//     accountHolderName: '',
//     accountNumber: '',
//     confirmAccountNumber: '',
//     ifscCode: '',
//     cancelledCheque: null,
//     existingChequeUrl: '',
//     isDefault: false,
//   });
//   const [isKycBankModalOpen, setIsKycBankModalOpen] = useState(false);
//   const [kycBankSaving, setKycBankSaving] = useState(false);
//   const [kycBankForm, setKycBankForm] = useState({
//     accountHolderName: '',
//     accountNumber: '',
//     confirmAccountNumber: '',
//     ifscCode: '',
//     cancelledCheque: null,
//     isDefault: false,
//   });

//   const [viewChequeUrl, setViewChequeUrl] = useState('');

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       setError('');
//       try {
//         const token = localStorage.getItem('vendorToken'); // adjust to your auth storage
//         const [profileRes, kycRes, bankAccountsRes] = await Promise.all([
//           apiGetMyVendorProfile(token),
//           apiGetMyKycSettings(token),
//           apiGetMyBankAccounts(token).catch(() => ({ data: { accounts: [] } })),
//         ]);
//         setVendor(profileRes.data.vendor);
//         setKyc(kycRes.data.kyc);
//         setBankAccounts(bankAccountsRes.data.accounts || []);
//       } catch (err) {
//         setError(
//           err?.response?.data?.message ||
//             'Failed to load settings. Please try again.',
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   const user = vendor
//     ? { fullName: vendor.fullName, emailAddress: vendor.emailAddress }
//     : {};

//   const resetBankForm = () => {
//     setBankForm({
//       accountHolderName: '',
//       accountNumber: '',
//       confirmAccountNumber: '',
//       ifscCode: '',
//       cancelledCheque: null,
//       existingChequeUrl: '',
//       isDefault: false,
//     });
//     setEditingBankId(null);
//   };

//   const openAddBankModal = () => {
//     resetBankForm();
//     setIsBankModalOpen(true);
//   };

//   const openEditBankModal = (acc) => {
//     setEditingBankId(acc._id);
//     setBankForm({
//       accountHolderName: acc.accountHolderName || '',
//       accountNumber: acc.accountNumber || '',
//       confirmAccountNumber: acc.confirmAccountNumber || acc.accountNumber || '',
//       ifscCode: acc.ifscCode || '',
//       cancelledCheque: null,
//       existingChequeUrl: acc.cancelledCheque || '',
//       isDefault: Boolean(acc.isDefault),
//     });
//     setIsBankModalOpen(true);
//   };

//   const handleSaveBankAccount = async () => {
//     if (
//       !bankForm.accountHolderName.trim() ||
//       !bankForm.accountNumber.trim() ||
//       !bankForm.ifscCode.trim()
//     ) {
//       toast.error('Please fill fields.');
//       return;
//     }
//     if (!/^\d{9,12}$/.test(bankForm.accountNumber.trim())) {
//       toast.error('Account number must be 9-12 digits only.');
//       return;
//     }
//     if (
//       bankForm.accountNumber.trim() !== bankForm.confirmAccountNumber.trim()
//     ) {
//       toast.error('Account numbers do not match.');
//       return;
//     }
//     if (!IFSC_REGEX.test(bankForm.ifscCode.trim().toUpperCase())) {
//       toast.error('Enter a valid IFSC code (e.g. SBIN0001234).');
//       return;
//     }
//     const token = localStorage.getItem('vendorToken');
//     setBankSaving(true);
//     try {
//       const fd = new FormData();
//       fd.append('accountHolderName', bankForm.accountHolderName);
//       fd.append('accountNumber', bankForm.accountNumber);
//       fd.append('confirmAccountNumber', bankForm.confirmAccountNumber);
//       fd.append('ifscCode', bankForm.ifscCode);
//       fd.append('isDefault', bankForm.isDefault ? 'true' : 'false');
//       if (bankForm.cancelledCheque)
//         fd.append('cancelledCheque', bankForm.cancelledCheque);

//       if (editingBankId) {
//         await apiUpdateBankAccount(editingBankId, fd, token);
//       } else {
//         await apiAddBankAccount(fd, token);
//       }
//       const [refreshed, kycRefreshed] = await Promise.all([
//         apiGetMyBankAccounts(token),
//         apiGetMyKycSettings(token),
//       ]);
//       setBankAccounts(refreshed.data.accounts || []);
//       setKyc(kycRefreshed.data.kyc);
//       setIsBankModalOpen(false);
//       resetBankForm();
//       toast.success('Bank account saved.');
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || 'Failed to save bank account.',
//       );
//     } finally {
//       setBankSaving(false);
//     }
//   };

//   const handleDeleteBankAccount = async (id) => {
//     const token = localStorage.getItem('vendorToken');
//     try {
//       await apiDeleteBankAccount(id, token);
//       setBankAccounts((prev) => prev.filter((a) => a._id !== id));
//       toast.success('Bank account removed.');
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || 'Failed to remove bank account.',
//       );
//     }
//   };

//   const openKycBankEditModal = () => {
//     setKycBankForm({
//       accountHolderName: kyc?.bank?.accountHolderName || '',
//       accountNumber: kyc?.bank?.accountNumber || '',
//       confirmAccountNumber: kyc?.bank?.accountNumber || '',
//       ifscCode: kyc?.bank?.ifscCode || '',
//       cancelledCheque: null,
//       isDefault: Boolean(kyc?.bank?.isDefault),
//     });
//     setIsKycBankModalOpen(true);
//   };

//   const handleSaveKycBankDetails = async () => {
//     if (
//       !kycBankForm.accountHolderName.trim() ||
//       !kycBankForm.accountNumber.trim() ||
//       !kycBankForm.ifscCode.trim()
//     ) {
//       toast.error('Please fill all required bank fields.');
//       return;
//     }
//     if (!/^\d{9,12}$/.test(kycBankForm.accountNumber.trim())) {
//       toast.error('Account number must be 9-12 digits only.');
//       return;
//     }
//     if (
//       kycBankForm.accountNumber.trim() !==
//       kycBankForm.confirmAccountNumber.trim()
//     ) {
//       toast.error('Account numbers do not match.');
//       return;
//     }
//     if (!IFSC_REGEX.test(kycBankForm.ifscCode.trim().toUpperCase())) {
//       toast.error('Enter a valid IFSC code (e.g. SBIN0001234).');
//       return;
//     }
//     const token = localStorage.getItem('vendorToken');
//     setKycBankSaving(true);
//     try {
//       const fd = new FormData();
//       fd.append('accountHolderName', kycBankForm.accountHolderName);
//       fd.append('accountNumber', kycBankForm.accountNumber);
//       fd.append('confirmAccountNumber', kycBankForm.confirmAccountNumber);
//       fd.append('ifscCode', kycBankForm.ifscCode);
//       if (kycBankForm.cancelledCheque)
//         fd.append('cancelledCheque', kycBankForm.cancelledCheque);
//       fd.append('isDefault', kycBankForm.isDefault ? 'true' : 'false');

//       const res = await apiUpdateMyKycBankDetails(fd, token);
//       setKyc((prev) => ({ ...prev, bank: res.data.bank }));
//       const refreshedAccounts = await apiGetMyBankAccounts(token);
//       setBankAccounts(refreshedAccounts.data.accounts || []);
//       setIsKycBankModalOpen(false);
//       toast.success('KYC bank details updated.');
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || 'Failed to update bank details.',
//       );
//     } finally {
//       setKycBankSaving(false);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-[#EEF4FA] overflow-hidden">
//       <VendorSidebar />

//       <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
//         <VendorTopBar user={user} />

//         <main className="flex-1 overflow-y-auto px-4 pb-4 pt-1 md:px-5 md:pb-5 lg:px-6 lg:pb-6">
//           <div className="mx-auto max-w-6xl">
//             {/* Tabs — scrollable on mobile */}
//             <div className="mb-5 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
//               <div className="flex w-max gap-1 rounded-lg bg-gray-100 p-1 sm:w-fit">
//                 {TABS.map((tab) => (
//                   <button
//                     key={tab.key}
//                     onClick={() => setActiveTab(tab.key)}
//                     className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
//                       activeTab === tab.key
//                         ? 'bg-white text-blue-600 shadow-sm'
//                         : 'text-gray-500 hover:text-gray-800'
//                     }`}
//                   >
//                     {tab.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {error && (
//               <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//                 {error}
//               </div>
//             )}

//             {loading ? (
//               <Skeleton />
//             ) : (
//               <div className="space-y-5 pb-6">
//                 {/* ACCOUNT TAB */}
//                 {activeTab === 'account' && vendor && (
//                   <>
//                     <Card title="Profile" icon={User}>
//                       <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                         <Field label="Business Name" value={vendor.fullName} />
//                         <Field
//                           label="Business Email"
//                           value={vendor.emailAddress}
//                         />
//                         <Field
//                           label="Phone Number"
//                           value={vendor.mobileNumber}
//                         />
//                         {/* <Field
//                           label="Referral Code"
//                           value={vendor.referralCode}
//                         /> */}
//                         {/* <div className="min-w-0">
//                           <p className="mb-1 text-xs font-medium text-gray-500">
//                             Verification
//                           </p>
//                           <StatusBadge
//                             status={vendor.isVerified ? 'Verified' : 'Pending'}
//                           />
//                         </div> */}
//                       </div>
//                       {/* <div className="mt-4 flex flex-wrap gap-2">
//                         <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
//                           Edit Profile
//                         </button>
//                         <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
//                           Change Password
//                         </button>
//                       </div> */}
//                     </Card>

//                     {/* <Card title="Account Actions">
//                       <div className="flex flex-wrap gap-2">
//                         <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
//                           Download My Data
//                         </button>
//                         <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
//                           Logout
//                         </button>
//                         <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
//                           Delete Account
//                         </button>
//                       </div>
//                     </Card> */}
//                   </>
//                 )}

//                 {/* BUSINESS TAB */}
//                 {(activeTab === 'business' || activeTab === 'account') &&
//                   kyc && (
//                     <Card title="Business Details" icon={Briefcase}>
//                       <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                         <Field
//                           label="Business Name"
//                           value={kyc.business?.shopName}
//                         />
//                         <Field
//                           label="Business Category"
//                           value={kyc.business?.businessCategory}
//                         />
//                         <Field
//                           label="Shop Act Number"
//                           value={kyc.business?.shopActNumber}
//                         />
//                         <Field label="GSTIN" value={kyc.business?.gstin} />
//                         <Field
//                           label="Primary Contact"
//                           value={kyc.business?.primaryContactNumber}
//                         />
//                         <Field
//                           label="Secondary Contact"
//                           value={kyc.business?.secondaryContactNumber}
//                         />
//                       </div>
//                       {/* <div className="mt-4 flex flex-wrap gap-3">
//                       {kyc.business?.gstCertificate && (
//                         <a
//                           href={kyc.business.gstCertificate}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="text-sm font-medium text-blue-600 hover:underline"
//                         >
//                           View GST Certificate
//                         </a>
//                       )}
//                       {kyc.business?.shopActLicense && (
//                         <a
//                           href={kyc.business.shopActLicense}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="text-sm font-medium text-blue-600 hover:underline"
//                         >
//                           View Shop Act License
//                         </a>
//                       )}
//                     </div> */}
//                     </Card>
//                   )}
//                 {/* BANK ACCOUNTS (KYC bank shown first, then vendor-added accounts) */}
//                 {(activeTab === 'kycBank' || activeTab === 'account') &&
//                   kyc && (
//                     <Card
//                       title="Bank Accounts"
//                       icon={Landmark}
//                       action={
//                         <button
//                           type="button"
//                           onClick={openAddBankModal}
//                           className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
//                         >
//                           <Plus className="h-4 w-4" strokeWidth={2.25} />
//                           Add Bank
//                         </button>
//                       }
//                     >
//                       {/* <div className="space-y-3">
//                         {kyc.bank?.accountNumber ? (
//                           <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
//                             <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
//                               <Field
//                                 label="Account Holder"
//                                 value={kyc.bank?.accountHolderName}
//                               />
//                               <Field
//                                 label="Account Number"
//                                 value={kyc.bank?.accountNumber}
//                               />
//                               <Field
//                                 label="IFSC Code"
//                                 value={kyc.bank?.ifscCode}
//                               />
//                             </div>
//                             <div className="flex shrink-0 items-center gap-2">
//                               {kyc.bank?.isDefault && (
//                                 <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
//                                   Default
//                                 </span>
//                               )}
//                               {kyc.bank?.cancelledCheque && (
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     setViewChequeUrl(kyc.bank.cancelledCheque)
//                                   }
//                                   className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
//                                 >
//                                   <Eye className="h-4 w-4" strokeWidth={2} />
//                                   View Cheque
//                                 </button>
//                               )}

//                               <button
//                                 type="button"
//                                 onClick={openKycBankEditModal}
//                                 className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
//                                 aria-label="Edit KYC bank account"
//                               >
//                                 <Pencil className="h-4 w-4" strokeWidth={2} />
//                               </button>
//                               <span
//                                 className="invisible rounded-lg border border-transparent p-2"
//                                 aria-hidden="true"
//                               >
//                                 <Trash2 className="h-4 w-4" strokeWidth={2} />
//                               </span>
//                             </div>
//                           </div>
//                         ) : null}

//                         {bankAccounts.map((acc) => (
//                           <div
//                             key={acc._id}
//                             className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"
//                           >
//                             <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
//                               <Field
//                                 label="Account Holder"
//                                 value={acc.accountHolderName}
//                               />
//                               <Field
//                                 label="Account Number"
//                                 value={acc.accountNumber}
//                               />
//                               <Field label="IFSC Code" value={acc.ifscCode} />
//                             </div>
//                             <div className="flex shrink-0 items-center gap-2">
//                               {acc.isDefault && (
//                                 <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
//                                   Default
//                                 </span>
//                               )}
//                               {acc.cancelledCheque && (
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     setViewChequeUrl(acc.cancelledCheque)
//                                   }
//                                   className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
//                                 >
//                                   <Eye className="h-4 w-4" strokeWidth={2} />
//                                   View Cheque
//                                 </button>
//                               )}
//                               <button
//                                 type="button"
//                                 onClick={() => openEditBankModal(acc)}
//                                 className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
//                                 aria-label="Edit bank account"
//                               >
//                                 <Pencil className="h-4 w-4" strokeWidth={2} />
//                               </button>
//                               <button
//                                 type="button"
//                                 onClick={() => handleDeleteBankAccount(acc._id)}
//                                 className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
//                                 aria-label="Delete bank account"
//                               >
//                                 <Trash2 className="h-4 w-4" strokeWidth={2} />
//                               </button>
//                             </div>
//                           </div>
//                         ))}

//                         {!kyc.bank?.accountNumber &&
//                         bankAccounts.length === 0 ? (
//                           <p className="text-sm text-gray-500">
//                             No bank accounts added yet.
//                           </p>
//                         ) : null}
//                       </div> */}
//                       <div className="overflow-x-auto">
//                         <table className="w-full min-w-[720px] text-sm">
//                           <thead>
//                             <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
//                               <th className="whitespace-nowrap px-3 py-2 font-medium">
//                                 Account Holder
//                               </th>
//                               <th className="whitespace-nowrap px-3 py-2 font-medium">
//                                 Account Number
//                               </th>
//                               <th className="whitespace-nowrap px-3 py-2 font-medium">
//                                 IFSC Code
//                               </th>
//                               <th className="whitespace-nowrap px-3 py-2 font-medium">
//                                 View
//                               </th>
//                               <th className="whitespace-nowrap px-3 py-2 font-medium">
//                                 Actions
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {kyc.bank?.accountNumber ? (
//                               <tr className="border-b border-gray-100">
//                                 <td className="whitespace-nowrap px-3 py-3">
//                                   <div className="flex items-center gap-2">
//                                     <span className="font-medium text-gray-800">
//                                       {kyc.bank?.accountHolderName || '—'}
//                                     </span>
//                                     {kyc.bank?.isDefault && (
//                                       <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
//                                         Default
//                                       </span>
//                                     )}
//                                   </div>
//                                 </td>
//                                 <td className="whitespace-nowrap px-3 py-3 text-gray-700">
//                                   {kyc.bank?.accountNumber || '—'}
//                                 </td>
//                                 <td className="whitespace-nowrap px-3 py-3 text-gray-700">
//                                   {kyc.bank?.ifscCode || '—'}
//                                 </td>
//                                 <td className="whitespace-nowrap px-3 py-3">
//                                   {kyc.bank?.cancelledCheque ? (
//                                     <button
//                                       type="button"
//                                       onClick={() =>
//                                         setViewChequeUrl(
//                                           kyc.bank.cancelledCheque,
//                                         )
//                                       }
//                                       className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
//                                     >
//                                       <Eye
//                                         className="h-4 w-4"
//                                         strokeWidth={2}
//                                       />
//                                       View Cheque
//                                     </button>
//                                   ) : (
//                                     <span className="text-xs text-gray-400">
//                                       —
//                                     </span>
//                                   )}
//                                 </td>
//                                 <td className="whitespace-nowrap px-3 py-3">
//                                   <div className="flex items-center gap-2">
//                                     <button
//                                       type="button"
//                                       onClick={openKycBankEditModal}
//                                       className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
//                                       aria-label="Edit KYC bank account"
//                                     >
//                                       <Pencil
//                                         className="h-4 w-4"
//                                         strokeWidth={2}
//                                       />
//                                     </button>
//                                     <span
//                                       className="invisible rounded-lg border border-transparent p-2"
//                                       aria-hidden="true"
//                                     >
//                                       <Trash2
//                                         className="h-4 w-4"
//                                         strokeWidth={2}
//                                       />
//                                     </span>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ) : null}

//                             {bankAccounts.map((acc) => (
//                               <tr
//                                 key={acc._id}
//                                 className="border-b border-gray-100 last:border-b-0"
//                               >
//                                 <td className="whitespace-nowrap px-3 py-3">
//                                   <div className="flex items-center gap-2">
//                                     <span className="font-medium text-gray-800">
//                                       {acc.accountHolderName || '—'}
//                                     </span>
//                                     {acc.isDefault && (
//                                       <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
//                                         Default
//                                       </span>
//                                     )}
//                                   </div>
//                                 </td>
//                                 <td className="whitespace-nowrap px-3 py-3 text-gray-700">
//                                   {acc.accountNumber || '—'}
//                                 </td>
//                                 <td className="whitespace-nowrap px-3 py-3 text-gray-700">
//                                   {acc.ifscCode || '—'}
//                                 </td>
//                                 <td className="whitespace-nowrap px-3 py-3">
//                                   {acc.cancelledCheque ? (
//                                     <button
//                                       type="button"
//                                       onClick={() =>
//                                         setViewChequeUrl(acc.cancelledCheque)
//                                       }
//                                       className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
//                                     >
//                                       <Eye
//                                         className="h-4 w-4"
//                                         strokeWidth={2}
//                                       />
//                                       View Cheque
//                                     </button>
//                                   ) : (
//                                     <span className="text-xs text-gray-400">
//                                       —
//                                     </span>
//                                   )}
//                                 </td>
//                                 <td className="whitespace-nowrap px-3 py-3">
//                                   <div className="flex items-center gap-2">
//                                     <button
//                                       type="button"
//                                       onClick={() => openEditBankModal(acc)}
//                                       className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
//                                       aria-label="Edit bank account"
//                                     >
//                                       <Pencil
//                                         className="h-4 w-4"
//                                         strokeWidth={2}
//                                       />
//                                     </button>
//                                     <button
//                                       type="button"
//                                       onClick={() =>
//                                         handleDeleteBankAccount(acc._id)
//                                       }
//                                       className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
//                                       aria-label="Delete bank account"
//                                     >
//                                       <Trash2
//                                         className="h-4 w-4"
//                                         strokeWidth={2}
//                                       />
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>

//                         {!kyc.bank?.accountNumber &&
//                         bankAccounts.length === 0 ? (
//                           <p className="px-3 py-4 text-sm text-gray-500">
//                             No bank accounts added yet.
//                           </p>
//                         ) : null}
//                       </div>
//                     </Card>
//                   )}

//                 {/* STORES TAB */}
//                 {/* {activeTab === 'stores' && kyc && (
//                   <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                     {kyc.stores?.length ? (
//                       kyc.stores.map((store) => (
//                         <Card
//                           key={store._id}
//                           title={store.storeName || 'Store'}
//                           action={
//                             <div className="flex items-center gap-2">
//                               {store.isDefault && (
//                                 <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
//                                   Default
//                                 </span>
//                               )}
//                               <StatusBadge
//                                 status={store.isActive ? 'approved' : 'draft'}
//                               />
//                             </div>
//                           }
//                         >
//                           {store.shopFrontPhotoUrl && (
//                             <img
//                               src={store.shopFrontPhotoUrl}
//                               alt={store.storeName}
//                               className="mb-3 h-32 w-full rounded-lg object-cover"
//                             />
//                           )}
//                           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                             <Field
//                               label="Address"
//                               value={store.completeAddress}
//                             />
//                             <Field label="Pincode" value={store.pincode} />
//                             <Field
//                               label="Service Radius"
//                               value={
//                                 store.serviceRadiusKm
//                                   ? `${store.serviceRadiusKm} km`
//                                   : ''
//                               }
//                             />
//                             <Field
//                               label="Delivery Zone"
//                               value={store.deliveryZoneType}
//                             />
//                             <Field
//                               label="Store Timings"
//                               value={store.storeTimings}
//                             />
//                             <Field
//                               label="Walk-in Access"
//                               value={store.walkInAccessLabel}
//                             />
//                           </div>
//                           {store.mapLocation && (
//                             <a
//                               href={store.mapLocation}
//                               target="_blank"
//                               rel="noreferrer"
//                               className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
//                             >
//                               View on Map
//                             </a>
//                           )}
//                         </Card>
//                       ))
//                     ) : (
//                       <p className="text-sm text-gray-500">
//                         No stores added yet.
//                       </p>
//                     )}
//                   </div>
//                 )} */}

//                 {/* BANK TAB */}
//                 {/* {(activeTab === 'bank' || activeTab === 'account') &&
//                   vendor && (
//                     <Card
//                       title="Bank & Payment"
//                       icon={Landmark}
//                       action={
//                         <StatusBadge status={vendor.bankDetails?.status} />
//                       }
//                     >
//                       <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                         <Field
//                           label="Account Holder"
//                           value={vendor.bankDetails?.accountHolderName}
//                         />
//                         <Field
//                           label="Bank Name"
//                           value={vendor.bankDetails?.bankName}
//                         />
//                         <Field
//                           label="Account Number"
//                           value={vendor.bankDetails?.accountNumber}
//                         />
//                         <Field
//                           label="IFSC Code"
//                           value={vendor.bankDetails?.ifscCode}
//                         />
//                       </div>
//                       {vendor.bankDetails?.status === 'Rejected' &&
//                         vendor.bankDetails?.rejectionReason && (
//                           <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
//                             Rejection reason:{' '}
//                             {vendor.bankDetails.rejectionReason}
//                           </div>
//                         )}
//                       <div className="mt-4">
//                         <button
//                           onClick={() =>
//                             router.push('/vendor/earnings-payout/settlements')
//                           }
//                           className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//                         >
//                           Update Bank Details
//                         </button>
//                       </div>
//                     </Card>
//                   )} */}

//                 {/* KYC TAB */}
//                 {(activeTab === 'kyc' || activeTab === 'account') && kyc && (
//                   <>
//                     <Card
//                       title="KYC Status"
//                       icon={ShieldCheck}
//                       action={<StatusBadge status={kyc.status} />}
//                     >
//                       {kyc.status === 'rejected' && kyc.rejectionReason && (
//                         <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
//                           {kyc.rejectionReason}
//                         </div>
//                       )}
//                       <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//                         {Object.entries(kyc.sectionsCompleted || {}).map(
//                           ([key, done]) => (
//                             <div
//                               key={key}
//                               className={`rounded-lg border px-3 py-2 text-center text-xs font-medium capitalize ${
//                                 done
//                                   ? 'border-green-200 bg-green-50 text-green-700'
//                                   : 'border-gray-200 bg-gray-50 text-gray-500'
//                               }`}
//                             >
//                               {done ? '✓ ' : '○ '}
//                               {key}
//                             </div>
//                           ),
//                         )}
//                       </div>
//                     </Card>
//                     <Card title="Identity Documents" icon={IdCard}>
//                       <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                         <Field
//                           label="PAN Number"
//                           value={kyc.personal?.panNumber}
//                         />
//                         <Field
//                           label="Aadhaar Number"
//                           value={kyc.personal?.aadhaarNumber}
//                         />
//                         <Field
//                           label="Date of Birth"
//                           value={kyc.personal?.dateOfBirth?.slice(0, 10)}
//                         />
//                       </div>
//                       {/* <div className="mt-4 flex flex-wrap gap-3">
//                         {kyc.personal?.panPhoto && (
//                           <a
//                             href={kyc.personal.panPhoto}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="text-sm font-medium text-blue-600 hover:underline"
//                           >
//                             View PAN Photo
//                           </a>
//                         )}
//                         {kyc.personal?.aadhaarFront && (
//                           <a
//                             href={kyc.personal.aadhaarFront}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="text-sm font-medium text-blue-600 hover:underline"
//                           >
//                             View Aadhaar Front
//                           </a>
//                         )}
//                         {kyc.personal?.aadhaarBack && (
//                           <a
//                             href={kyc.personal.aadhaarBack}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="text-sm font-medium text-blue-600 hover:underline"
//                           >
//                             View Aadhaar Back
//                           </a>
//                         )}
//                       </div> */}
//                       <div className="mt-4 flex flex-wrap gap-3">
//                         {kyc.personal?.panPhoto && (
//                           <a
//                             href={kyc.personal.panPhoto}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="text-sm font-medium text-blue-600 hover:underline"
//                           >
//                             View PAN Photo
//                           </a>
//                         )}
//                         {kyc.personal?.aadhaarFront && (
//                           <a
//                             href={kyc.personal.aadhaarFront}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="ml-14 text-sm font-medium text-blue-600 hover:underline sm:ml-28"
//                           >
//                             View Aadhaar Front
//                           </a>
//                         )}
//                         {kyc.personal?.aadhaarBack && (
//                           <a
//                             href={kyc.personal.aadhaarBack}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="text-sm font-medium text-blue-600 hover:underline"
//                           >
//                             View Aadhaar Back
//                           </a>
//                         )}
//                       </div>
//                     </Card>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {isKycBankModalOpen ? (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//           <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
//             <div className="flex shrink-0 items-center justify-between px-5 pt-5">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Edit Bank Account
//               </h3>
//               <button
//                 type="button"
//                 onClick={() => setIsKycBankModalOpen(false)}
//                 className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
//                 aria-label="Close"
//               >
//                 <X className="h-5 w-5" strokeWidth={2} />
//               </button>
//             </div>
//             <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-4">
//               <div className="space-y-3">
//                 <div className="space-y-1.5">
//                   <label className="block text-sm font-medium text-gray-800">
//                     Account Holder Name
//                   </label>
//                   <input
//                     value={kycBankForm.accountHolderName}
//                     onChange={(e) =>
//                       setKycBankForm((p) => ({
//                         ...p,
//                         accountHolderName: e.target.value,
//                       }))
//                     }
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1.5">
//                     <label className="block text-sm font-medium text-gray-800">
//                       Account Number
//                     </label>
//                     <input
//                       value={kycBankForm.accountNumber}
//                       onChange={(e) =>
//                         setKycBankForm((p) => ({
//                           ...p,
//                           accountNumber: e.target.value
//                             .replace(/\D/g, '')
//                             .slice(0, 12),
//                         }))
//                       }
//                       inputMode="numeric"
//                       maxLength={12}
//                       className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="block text-sm font-medium text-gray-800">
//                       Confirm Account Number
//                     </label>
//                     <input
//                       value={kycBankForm.confirmAccountNumber}
//                       onChange={(e) =>
//                         setKycBankForm((p) => ({
//                           ...p,
//                           confirmAccountNumber: e.target.value
//                             .replace(/\D/g, '')
//                             .slice(0, 12),
//                         }))
//                       }
//                       inputMode="numeric"
//                       maxLength={12}
//                       className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-1.5">
//                   <label className="block text-sm font-medium text-gray-800">
//                     IFSC Code
//                   </label>
//                   <input
//                     value={kycBankForm.ifscCode}
//                     onChange={(e) =>
//                       setKycBankForm((p) => ({
//                         ...p,
//                         ifscCode: e.target.value
//                           .toUpperCase()
//                           .replace(/[^A-Z0-9]/g, '')
//                           .slice(0, 11),
//                       }))
//                     }
//                     maxLength={11}
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <label className="block text-sm font-medium text-gray-800">
//                     Cancelled Cheque{' '}
//                     {/* <span className="text-xs font-normal text-gray-500">
//                     (leave empty to keep existing)
//                   </span> */}
//                   </label>
//                   {kycBankForm.cancelledCheque instanceof File ? (
//                     <img
//                       src={URL.createObjectURL(kycBankForm.cancelledCheque)}
//                       alt="New cheque preview"
//                       className="h-28 w-full rounded-lg border border-gray-200 object-cover"
//                     />
//                   ) : kyc?.bank?.cancelledCheque ? (
//                     <button
//                       type="button"
//                       onClick={() => setViewChequeUrl(kyc.bank.cancelledCheque)}
//                       className="flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
//                     >
//                       {String(kyc.bank.cancelledCheque)
//                         .toLowerCase()
//                         .includes('.pdf') ? (
//                         <span className="text-sm font-medium text-blue-600">
//                           View current cheque (PDF)
//                         </span>
//                       ) : (
//                         <img
//                           src={kyc.bank.cancelledCheque}
//                           alt="Current cheque"
//                           className="h-full w-full object-cover"
//                         />
//                       )}
//                     </button>
//                   ) : null}
//                   <input
//                     type="file"
//                     accept="image/*,.pdf"
//                     onChange={(e) =>
//                       setKycBankForm((p) => ({
//                         ...p,
//                         cancelledCheque: e.target.files?.[0] || null,
//                       }))
//                     }
//                     className="w-full text-sm"
//                   />
//                 </div>
//                 <label className="flex items-center gap-2 text-sm text-gray-800">
//                   <input
//                     type="checkbox"
//                     checked={kycBankForm.isDefault}
//                     onChange={(e) =>
//                       setKycBankForm((p) => ({
//                         ...p,
//                         isDefault: e.target.checked,
//                       }))
//                     }
//                     className="h-4 w-4 rounded border-gray-300"
//                   />
//                   Set as default account
//                 </label>
//               </div>
//             </div>
//             <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 px-5 py-4">
//               <button
//                 type="button"
//                 onClick={() => setIsKycBankModalOpen(false)}
//                 className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 disabled={kycBankSaving}
//                 onClick={handleSaveKycBankDetails}
//                 className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
//               >
//                 {kycBankSaving ? 'Saving...' : 'Save Changes'}
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}

//       {isBankModalOpen ? (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//           <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
//             <div className="flex shrink-0 items-center justify-between px-5 pt-5">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {editingBankId ? 'Edit Bank Account' : 'Add Bank Account'}
//               </h3>
//               <button
//                 type="button"
//                 onClick={() => setIsBankModalOpen(false)}
//                 className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
//                 aria-label="Close"
//               >
//                 <X className="h-5 w-5" strokeWidth={2} />
//               </button>
//             </div>
//             <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-4">
//               <div className="space-y-3">
//                 <div className="space-y-1.5">
//                   <label className="block text-sm font-medium text-gray-800">
//                     Account Holder Name
//                   </label>
//                   <input
//                     value={bankForm.accountHolderName}
//                     onChange={(e) =>
//                       setBankForm((p) => ({
//                         ...p,
//                         accountHolderName: e.target.value,
//                       }))
//                     }
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1.5">
//                     <label className="block text-sm font-medium text-gray-800">
//                       Account Number
//                     </label>
//                     <input
//                       value={bankForm.accountNumber}
//                       onChange={(e) =>
//                         setBankForm((p) => ({
//                           ...p,
//                           accountNumber: e.target.value
//                             .replace(/\D/g, '')
//                             .slice(0, 12),
//                         }))
//                       }
//                       inputMode="numeric"
//                       maxLength={12}
//                       className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="block text-sm font-medium text-gray-800">
//                       Confirm Account Number
//                     </label>
//                     <input
//                       value={bankForm.confirmAccountNumber}
//                       onChange={(e) =>
//                         setBankForm((p) => ({
//                           ...p,
//                           confirmAccountNumber: e.target.value
//                             .replace(/\D/g, '')
//                             .slice(0, 12),
//                         }))
//                       }
//                       inputMode="numeric"
//                       maxLength={12}
//                       className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-1.5">
//                   <label className="block text-sm font-medium text-gray-800">
//                     IFSC Code
//                   </label>
//                   <input
//                     value={bankForm.ifscCode}
//                     onChange={(e) =>
//                       setBankForm((p) => ({
//                         ...p,
//                         ifscCode: e.target.value
//                           .toUpperCase()
//                           .replace(/[^A-Z0-9]/g, '')
//                           .slice(0, 11),
//                       }))
//                     }
//                     maxLength={11}
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <label className="block text-sm font-medium text-gray-800">
//                     Cancelled Cheque{' '}
//                     {editingBankId && (
//                       <span className="text-xs font-normal text-gray-500">
//                         (leave empty to keep existing)
//                       </span>
//                     )}
//                   </label>
//                   {bankForm.cancelledCheque instanceof File ? (
//                     <img
//                       src={URL.createObjectURL(bankForm.cancelledCheque)}
//                       alt="New cheque preview"
//                       className="h-28 w-full rounded-lg border border-gray-200 object-cover"
//                     />
//                   ) : bankForm.existingChequeUrl ? (
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setViewChequeUrl(bankForm.existingChequeUrl)
//                       }
//                       className="flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
//                     >
//                       {String(bankForm.existingChequeUrl)
//                         .toLowerCase()
//                         .includes('.pdf') ? (
//                         <span className="text-sm font-medium text-blue-600">
//                           View current cheque (PDF)
//                         </span>
//                       ) : (
//                         <img
//                           src={bankForm.existingChequeUrl}
//                           alt="Current cheque"
//                           className="h-full w-full object-cover"
//                         />
//                       )}
//                     </button>
//                   ) : null}
//                   <input
//                     type="file"
//                     accept="image/*,.pdf"
//                     onChange={(e) =>
//                       setBankForm((p) => ({
//                         ...p,
//                         cancelledCheque: e.target.files?.[0] || null,
//                       }))
//                     }
//                     className="w-full text-sm"
//                   />
//                 </div>
//                 <label className="flex items-center gap-2 text-sm text-gray-800">
//                   <input
//                     type="checkbox"
//                     checked={bankForm.isDefault}
//                     onChange={(e) =>
//                       setBankForm((p) => ({
//                         ...p,
//                         isDefault: e.target.checked,
//                       }))
//                     }
//                     className="h-4 w-4 rounded border-gray-300"
//                   />
//                   Set as default account
//                 </label>
//               </div>
//             </div>
//             <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 px-5 py-4">
//               <button
//                 type="button"
//                 onClick={() => setIsBankModalOpen(false)}
//                 className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 disabled={bankSaving}
//                 onClick={handleSaveBankAccount}
//                 className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
//               >
//                 {bankSaving ? 'Saving...' : 'Save Bank Account'}
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : null}

//       {viewChequeUrl ? (
//         <div
//           className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
//           onClick={() => setViewChequeUrl('')}
//           role="presentation"
//         >
//           <div
//             className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-3 shadow-xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="mb-2 flex items-center justify-between gap-3">
//               <a
//                 href={viewChequeUrl}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="text-sm font-medium text-blue-600 hover:underline"
//               >
//                 Open in new tab
//               </a>
//               <button
//                 type="button"
//                 onClick={() => setViewChequeUrl('')}
//                 className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
//                 aria-label="Close"
//               >
//                 <X className="h-5 w-5" strokeWidth={2} />
//               </button>
//             </div>
//             <div className="min-h-0 flex-1 overflow-auto">
//               {String(viewChequeUrl).toLowerCase().includes('.pdf') ? (
//                 <object
//                   data={viewChequeUrl}
//                   type="application/pdf"
//                   className="h-[70vh] w-full rounded-lg border border-gray-200"
//                 >
//                   <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-center">
//                     <p className="text-sm text-gray-600">
//                       Preview isn&apos;t available for this file.
//                     </p>
//                     <a
//                       href={viewChequeUrl}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-sm font-medium text-blue-600 hover:underline"
//                     >
//                       Open in new tab
//                     </a>
//                   </div>
//                 </object>
//               ) : (
//                 <img
//                   src={viewChequeUrl}
//                   alt="Cancelled cheque"
//                   className="max-h-[70vh] w-full rounded-lg object-contain"
//                   onError={(e) => {
//                     e.currentTarget.style.display = 'none';
//                     e.currentTarget.nextSibling.style.display = 'flex';
//                   }}
//                 />
//               )}
//               <div className="hidden h-[70vh] w-full flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-center">
//                 <p className="text-sm text-gray-600">
//                   Preview isn&apos;t available for this file.
//                 </p>
//                 <a
//                   href={viewChequeUrl}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="text-sm font-medium text-blue-600 hover:underline"
//                 >
//                   Open in new tab
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// };

// export default Settings;

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VendorSidebar from '../../Components/Common/VendorSidebar';
import VendorTopBar from '../../Components/Common/VendorTopBar';
import {
  apiGetMyKycSettings,
  apiGetMyVendorProfile,
  apiGetMyBankAccounts,
  apiAddBankAccount,
  apiUpdateBankAccount,
  apiDeleteBankAccount,
  apiUpdateMyKycBankDetails,
} from '@/service/api';
import {
  User,
  Briefcase,
  Landmark,
  IdCard,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';

const TABS = [
  { key: 'account', label: 'Overview' },
  { key: 'business', label: 'Business' },
  // { key: 'stores', label: 'Stores' },
  { key: 'kycBank', label: 'Bank' },
  // { key: 'bank', label: 'Bank' },
  { key: 'kyc', label: 'KYC Status' },
];
const StatusBadge = ({ status }) => {
  const map = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-600',
    Verified: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Rejected: 'bg-red-100 text-red-700',
    'Not Added': 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${
        map[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status || 'Unknown'}
    </span>
  );
};

const Field = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="truncate text-sm font-medium text-gray-800">{value || '—'}</p>
  </div>
);
const Card = ({ title, icon: Icon, action, children }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800 sm:text-lg">
        {Icon && <Icon className="h-5 w-5 text-gray-500" />}
        {title}
      </h2>
      {action}
    </div>
    {children}
  </div>
);

const Skeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-24 rounded-xl bg-gray-200" />
    <div className="h-40 rounded-xl bg-gray-200" />
    <div className="h-40 rounded-xl bg-gray-200" />
  </div>
);

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const Settings = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendor, setVendor] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState(null);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    cancelledCheque: null,
    existingChequeUrl: '',
    isDefault: false,
  });
  const [isKycBankModalOpen, setIsKycBankModalOpen] = useState(false);
  const [kycBankSaving, setKycBankSaving] = useState(false);
  const [kycBankForm, setKycBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    cancelledCheque: null,
    isDefault: false,
  });

  const [viewChequeUrl, setViewChequeUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('vendorToken'); // adjust to your auth storage
        const [profileRes, kycRes, bankAccountsRes] = await Promise.all([
          apiGetMyVendorProfile(token),
          apiGetMyKycSettings(token),
          apiGetMyBankAccounts(token).catch(() => ({ data: { accounts: [] } })),
        ]);
        setVendor(profileRes.data.vendor);
        setKyc(kycRes.data.kyc);
        setBankAccounts(bankAccountsRes.data.accounts || []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            'Failed to load settings. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // const user = vendor
  //   ? { fullName: vendor.fullName, emailAddress: vendor.emailAddress }
  //   : {};
  const user = vendor
    ? { fullName: vendor.fullName, emailAddress: vendor.emailAddress }
    : {};

  const totalBankAccountsCount =
    (kyc?.bank?.accountNumber ? 1 : 0) + bankAccounts.length;

  const resetBankForm = () => {
    setBankForm({
      accountHolderName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      cancelledCheque: null,
      existingChequeUrl: '',
      isDefault: false,
    });
    setEditingBankId(null);
  };

  const openAddBankModal = () => {
    resetBankForm();
    setIsBankModalOpen(true);
  };

  // const openEditBankModal = (acc) => {
  //   setEditingBankId(acc._id);
  //   setBankForm({
  //     accountHolderName: acc.accountHolderName || '',
  //     accountNumber: acc.accountNumber || '',
  //     confirmAccountNumber: acc.confirmAccountNumber || acc.accountNumber || '',
  //     ifscCode: acc.ifscCode || '',
  //     cancelledCheque: null,
  //     existingChequeUrl: acc.cancelledCheque || '',
  //     isDefault: Boolean(acc.isDefault),
  //   });
  //   setIsBankModalOpen(true);
  // };

  const openEditBankModal = (acc) => {
    setEditingBankId(acc._id);
    const isOnlyAccount =
      bankAccounts.length === 1 && !kyc?.bank?.accountNumber;
    setBankForm({
      accountHolderName: acc.accountHolderName || '',
      accountNumber: acc.accountNumber || '',
      confirmAccountNumber: acc.confirmAccountNumber || acc.accountNumber || '',
      ifscCode: acc.ifscCode || '',
      cancelledCheque: null,
      existingChequeUrl: acc.cancelledCheque || '',
      isDefault: Boolean(acc.isDefault) || isOnlyAccount,
    });
    setIsBankModalOpen(true);
  };

  const handleSaveBankAccount = async () => {
    if (
      !bankForm.accountHolderName.trim() ||
      !bankForm.accountNumber.trim() ||
      !bankForm.ifscCode.trim()
    ) {
      toast.error('Please fill fields.');
      return;
    }
    if (!/^\d{9,18}$/.test(bankForm.accountNumber.trim())) {
      toast.error('Account number must be 9-18 digits only.');
      return;
    }
    if (
      bankForm.accountNumber.trim() !== bankForm.confirmAccountNumber.trim()
    ) {
      toast.error('Account numbers do not match.');
      return;
    }
    if (!IFSC_REGEX.test(bankForm.ifscCode.trim().toUpperCase())) {
      toast.error('Enter a valid IFSC code (e.g. SBIN0001234).');
      return;
    }
    const token = localStorage.getItem('vendorToken');
    setBankSaving(true);
    try {
      const fd = new FormData();
      fd.append('accountHolderName', bankForm.accountHolderName);
      fd.append('accountNumber', bankForm.accountNumber);
      fd.append('confirmAccountNumber', bankForm.confirmAccountNumber);
      fd.append('ifscCode', bankForm.ifscCode);
      // fd.append('isDefault', bankForm.isDefault ? 'true' : 'false');
      // if (bankForm.cancelledCheque)
      // const shouldForceDefault = !editingBankId && totalBankAccountsCount === 0;
      const shouldForceDefault = editingBankId
        ? bankAccounts.length === 1 && !kyc?.bank?.accountNumber
        : totalBankAccountsCount === 0;
      fd.append(
        'isDefault',
        bankForm.isDefault || shouldForceDefault ? 'true' : 'false',
      );
      if (bankForm.cancelledCheque)
        fd.append('cancelledCheque', bankForm.cancelledCheque);

      if (editingBankId) {
        await apiUpdateBankAccount(editingBankId, fd, token);
      } else {
        await apiAddBankAccount(fd, token);
      }
      const [refreshed, kycRefreshed] = await Promise.all([
        apiGetMyBankAccounts(token),
        apiGetMyKycSettings(token),
      ]);
      setBankAccounts(refreshed.data.accounts || []);
      setKyc(kycRefreshed.data.kyc);
      setIsBankModalOpen(false);
      resetBankForm();
      toast.success('Bank account saved.');
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to save bank account.',
      );
    } finally {
      setBankSaving(false);
    }
  };

  const handleDeleteBankAccount = async (id) => {
    const token = localStorage.getItem('vendorToken');
    try {
      await apiDeleteBankAccount(id, token);
      setBankAccounts((prev) => prev.filter((a) => a._id !== id));
      toast.success('Bank account removed.');
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to remove bank account.',
      );
    }
  };

  // const openKycBankEditModal = () => {
  //   setKycBankForm({
  //     accountHolderName: kyc?.bank?.accountHolderName || '',
  //     accountNumber: kyc?.bank?.accountNumber || '',
  //     confirmAccountNumber: kyc?.bank?.accountNumber || '',
  //     ifscCode: kyc?.bank?.ifscCode || '',
  //     cancelledCheque: null,
  //     isDefault: Boolean(kyc?.bank?.isDefault),
  //   });
  //   setIsKycBankModalOpen(true);
  // };

  // const openKycBankEditModal = () => {
  //   const isOnlyAccount = bankAccounts.length === 0;
  //   setKycBankForm({
  //     accountHolderName: kyc?.bank?.accountHolderName || '',
  //     accountNumber: kyc?.bank?.accountNumber || '',
  //     confirmAccountNumber: kyc?.bank?.accountNumber || '',
  //     ifscCode: kyc?.bank?.ifscCode || '',
  //     cancelledCheque: null,
  //     isDefault: Boolean(kyc?.bank?.isDefault) || isOnlyAccount,
  //   });
  //   setIsKycBankModalOpen(true);
  // };

  const openKycBankEditModal = () => {
    const isOnlyAccount =
      bankAccounts.length === 0 && Boolean(kyc?.bank?.accountNumber);
    setKycBankForm({
      accountHolderName: kyc?.bank?.accountHolderName || '',
      accountNumber: kyc?.bank?.accountNumber || '',
      confirmAccountNumber: kyc?.bank?.accountNumber || '',
      ifscCode: kyc?.bank?.ifscCode || '',
      cancelledCheque: null,
      isDefault: Boolean(kyc?.bank?.isDefault) || isOnlyAccount,
    });
    setIsKycBankModalOpen(true);
  };

  const handleSaveKycBankDetails = async () => {
    if (
      !kycBankForm.accountHolderName.trim() ||
      !kycBankForm.accountNumber.trim() ||
      !kycBankForm.ifscCode.trim()
    ) {
      toast.error('Please fill all required bank fields.');
      return;
    }
    if (!/^\d{9,18}$/.test(kycBankForm.accountNumber.trim())) {
      toast.error('Account number must be 9-18 digits only.');
      return;
    }
    if (
      kycBankForm.accountNumber.trim() !==
      kycBankForm.confirmAccountNumber.trim()
    ) {
      toast.error('Account numbers do not match.');
      return;
    }
    if (!IFSC_REGEX.test(kycBankForm.ifscCode.trim().toUpperCase())) {
      toast.error('Enter a valid IFSC code (e.g. SBIN0001234).');
      return;
    }
    const token = localStorage.getItem('vendorToken');
    setKycBankSaving(true);
    try {
      const fd = new FormData();
      fd.append('accountHolderName', kycBankForm.accountHolderName);
      fd.append('accountNumber', kycBankForm.accountNumber);
      fd.append('confirmAccountNumber', kycBankForm.confirmAccountNumber);
      fd.append('ifscCode', kycBankForm.ifscCode);
      // if (kycBankForm.cancelledCheque)
      //   fd.append('cancelledCheque', kycBankForm.cancelledCheque);
      // fd.append('isDefault', kycBankForm.isDefault ? 'true' : 'false');
      if (kycBankForm.cancelledCheque)
        fd.append('cancelledCheque', kycBankForm.cancelledCheque);
      // const shouldForceKycDefault =
      //   bankAccounts.length === 0 && !kyc?.bank?.accountNumber;
      // const shouldForceKycDefault = bankAccounts.length === 0;
      const shouldForceKycDefault =
        bankAccounts.length === 0 && Boolean(kyc?.bank?.accountNumber);
      fd.append(
        'isDefault',
        kycBankForm.isDefault || shouldForceKycDefault ? 'true' : 'false',
      );

      const res = await apiUpdateMyKycBankDetails(fd, token);
      setKyc((prev) => ({ ...prev, bank: res.data.bank }));
      const refreshedAccounts = await apiGetMyBankAccounts(token);
      setBankAccounts(refreshedAccounts.data.accounts || []);
      setIsKycBankModalOpen(false);
      toast.success('KYC bank details updated.');
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to update bank details.',
      );
    } finally {
      setKycBankSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#EEF4FA] overflow-hidden">
      <VendorSidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <VendorTopBar user={user} />

        <main className="flex-1 overflow-y-auto px-4 pb-4 pt-1 md:px-5 md:pb-5 lg:px-6 lg:pb-6">
          <div className="mx-auto max-w-6xl">
            {/* Tabs — scrollable on mobile */}
            <div className="mb-5 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <div className="flex w-max gap-1 rounded-lg bg-gray-100 p-1 sm:w-fit">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <Skeleton />
            ) : (
              <div className="space-y-5 pb-6">
                {/* ACCOUNT TAB */}
                {activeTab === 'account' && vendor && (
                  <>
                    <Card title="Profile" icon={User}>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Field label="Business Name" value={vendor.fullName} />
                        <Field
                          label="Business Email"
                          value={vendor.emailAddress}
                        />
                        <Field
                          label="Phone Number"
                          value={vendor.mobileNumber}
                        />
                        {/* <Field
                          label="Referral Code"
                          value={vendor.referralCode}
                        /> */}
                        {/* <div className="min-w-0">
                          <p className="mb-1 text-xs font-medium text-gray-500">
                            Verification
                          </p>
                          <StatusBadge
                            status={vendor.isVerified ? 'Verified' : 'Pending'}
                          />
                        </div> */}
                      </div>
                      {/* <div className="mt-4 flex flex-wrap gap-2">
                        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                          Edit Profile
                        </button>
                        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Change Password
                        </button>
                      </div> */}
                    </Card>

                    {/* <Card title="Account Actions">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Download My Data
                        </button>
                        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Logout
                        </button>
                        <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                          Delete Account
                        </button>
                      </div>
                    </Card> */}
                  </>
                )}

                {/* BUSINESS TAB */}
                {(activeTab === 'business' || activeTab === 'account') &&
                  kyc && (
                    <Card title="Business Details" icon={Briefcase}>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Field
                          label="Business Name"
                          value={kyc.business?.shopName}
                        />
                        <Field
                          label="Business Category"
                          value={kyc.business?.businessCategory}
                        />
                        <Field
                          label="Shop Act Number"
                          value={kyc.business?.shopActNumber}
                        />
                        <Field label="GSTIN" value={kyc.business?.gstin} />
                        <Field
                          label="Primary Contact"
                          value={kyc.business?.primaryContactNumber}
                        />
                        <Field
                          label="Secondary Contact"
                          value={kyc.business?.secondaryContactNumber}
                        />
                      </div>
                      {/* <div className="mt-4 flex flex-wrap gap-3">
                      {kyc.business?.gstCertificate && (
                        <a
                          href={kyc.business.gstCertificate}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          View GST Certificate
                        </a>
                      )}
                      {kyc.business?.shopActLicense && (
                        <a
                          href={kyc.business.shopActLicense}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          View Shop Act License
                        </a>
                      )}
                    </div> */}
                    </Card>
                  )}
                {/* BANK ACCOUNTS (KYC bank shown first, then vendor-added accounts) */}
                {(activeTab === 'kycBank' || activeTab === 'account') &&
                  kyc && (
                    <Card
                      title="Bank Accounts"
                      icon={Landmark}
                      action={
                        <button
                          type="button"
                          onClick={openAddBankModal}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.25} />
                          Add Bank
                        </button>
                      }
                    >
                      {/* <div className="space-y-3">
                        {kyc.bank?.accountNumber ? (
                          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
                              <Field
                                label="Account Holder"
                                value={kyc.bank?.accountHolderName}
                              />
                              <Field
                                label="Account Number"
                                value={kyc.bank?.accountNumber}
                              />
                              <Field
                                label="IFSC Code"
                                value={kyc.bank?.ifscCode}
                              />
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {kyc.bank?.isDefault && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                                  Default
                                </span>
                              )}
                              {kyc.bank?.cancelledCheque && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewChequeUrl(kyc.bank.cancelledCheque)
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4" strokeWidth={2} />
                                  View Cheque
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={openKycBankEditModal}
                                className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                                aria-label="Edit KYC bank account"
                              >
                                <Pencil className="h-4 w-4" strokeWidth={2} />
                              </button>
                              <span
                                className="invisible rounded-lg border border-transparent p-2"
                                aria-hidden="true"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={2} />
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {bankAccounts.map((acc) => (
                          <div
                            key={acc._id}
                            className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
                              <Field
                                label="Account Holder"
                                value={acc.accountHolderName}
                              />
                              <Field
                                label="Account Number"
                                value={acc.accountNumber}
                              />
                              <Field label="IFSC Code" value={acc.ifscCode} />
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {acc.isDefault && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                                  Default
                                </span>
                              )}
                              {acc.cancelledCheque && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewChequeUrl(acc.cancelledCheque)
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4" strokeWidth={2} />
                                  View Cheque
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openEditBankModal(acc)}
                                className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                                aria-label="Edit bank account"
                              >
                                <Pencil className="h-4 w-4" strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBankAccount(acc._id)}
                                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                aria-label="Delete bank account"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {!kyc.bank?.accountNumber &&
                        bankAccounts.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No bank accounts added yet.
                          </p>
                        ) : null}
                      </div> */}
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
                              <th className="whitespace-nowrap px-3 py-2 font-medium">
                                Account Holder
                              </th>
                              <th className="whitespace-nowrap px-3 py-2 font-medium">
                                Account Number
                              </th>
                              <th className="whitespace-nowrap px-3 py-2 font-medium">
                                IFSC Code
                              </th>
                              <th className="whitespace-nowrap px-3 py-2 font-medium">
                                View
                              </th>
                              <th className="whitespace-nowrap px-3 py-2 font-medium">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {kyc.bank?.accountNumber ? (
                              <tr className="border-b border-gray-100">
                                <td className="whitespace-nowrap px-3 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">
                                      {kyc.bank?.accountHolderName || '—'}
                                    </span>
                                    {/* {kyc.bank?.isDefault && (
                                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                                        Default
                                      </span>
                                    )} */}
                                    {(kyc.bank?.isDefault ||
                                      !bankAccounts.some(
                                        (a) => a.isDefault,
                                      )) && (
                                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                                  {kyc.bank?.accountNumber || '—'}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                                  {kyc.bank?.ifscCode || '—'}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                  {kyc.bank?.cancelledCheque ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setViewChequeUrl(
                                          kyc.bank.cancelledCheque,
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                      <Eye
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                      />
                                      View Cheque
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-400">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={openKycBankEditModal}
                                      className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                                      aria-label="Edit KYC bank account"
                                    >
                                      <Pencil
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                      />
                                    </button>
                                    <span
                                      className="invisible rounded-lg border border-transparent p-2"
                                      aria-hidden="true"
                                    >
                                      <Trash2
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                      />
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ) : null}

                            {bankAccounts.map((acc) => (
                              <tr
                                key={acc._id}
                                className="border-b border-gray-100 last:border-b-0"
                              >
                                <td className="whitespace-nowrap px-3 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">
                                      {acc.accountHolderName || '—'}
                                    </span>
                                    {/* {acc.isDefault && (
                                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                                        Default
                                      </span>
                                    )} */}
                                    {acc.isDefault && (
                                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                                  {acc.accountNumber || '—'}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                                  {acc.ifscCode || '—'}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                  {acc.cancelledCheque ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setViewChequeUrl(acc.cancelledCheque)
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                      <Eye
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                      />
                                      View Cheque
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-400">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openEditBankModal(acc)}
                                      className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                                      aria-label="Edit bank account"
                                    >
                                      <Pencil
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteBankAccount(acc._id)
                                      }
                                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                      aria-label="Delete bank account"
                                    >
                                      <Trash2
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {!kyc.bank?.accountNumber &&
                        bankAccounts.length === 0 ? (
                          <p className="px-3 py-4 text-sm text-gray-500">
                            No bank accounts added yet.
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  )}

                {/* STORES TAB */}
                {/* {activeTab === 'stores' && kyc && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {kyc.stores?.length ? (
                      kyc.stores.map((store) => (
                        <Card
                          key={store._id}
                          title={store.storeName || 'Store'}
                          action={
                            <div className="flex items-center gap-2">
                              {store.isDefault && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  Default
                                </span>
                              )}
                              <StatusBadge
                                status={store.isActive ? 'approved' : 'draft'}
                              />
                            </div>
                          }
                        >
                          {store.shopFrontPhotoUrl && (
                            <img
                              src={store.shopFrontPhotoUrl}
                              alt={store.storeName}
                              className="mb-3 h-32 w-full rounded-lg object-cover"
                            />
                          )}
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Field
                              label="Address"
                              value={store.completeAddress}
                            />
                            <Field label="Pincode" value={store.pincode} />
                            <Field
                              label="Service Radius"
                              value={
                                store.serviceRadiusKm
                                  ? `${store.serviceRadiusKm} km`
                                  : ''
                              }
                            />
                            <Field
                              label="Delivery Zone"
                              value={store.deliveryZoneType}
                            />
                            <Field
                              label="Store Timings"
                              value={store.storeTimings}
                            />
                            <Field
                              label="Walk-in Access"
                              value={store.walkInAccessLabel}
                            />
                          </div>
                          {store.mapLocation && (
                            <a
                              href={store.mapLocation}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                            >
                              View on Map
                            </a>
                          )}
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No stores added yet.
                      </p>
                    )}
                  </div>
                )} */}

                {/* BANK TAB */}
                {/* {(activeTab === 'bank' || activeTab === 'account') &&
                  vendor && (
                    <Card
                      title="Bank & Payment"
                      icon={Landmark}
                      action={
                        <StatusBadge status={vendor.bankDetails?.status} />
                      }
                    >
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Field
                          label="Account Holder"
                          value={vendor.bankDetails?.accountHolderName}
                        />
                        <Field
                          label="Bank Name"
                          value={vendor.bankDetails?.bankName}
                        />
                        <Field
                          label="Account Number"
                          value={vendor.bankDetails?.accountNumber}
                        />
                        <Field
                          label="IFSC Code"
                          value={vendor.bankDetails?.ifscCode}
                        />
                      </div>
                      {vendor.bankDetails?.status === 'Rejected' &&
                        vendor.bankDetails?.rejectionReason && (
                          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                            Rejection reason:{' '}
                            {vendor.bankDetails.rejectionReason}
                          </div>
                        )}
                      <div className="mt-4">
                        <button
                          onClick={() =>
                            router.push('/vendor/earnings-payout/settlements')
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Update Bank Details
                        </button>
                      </div>
                    </Card>
                  )} */}

                {/* KYC TAB */}
                {(activeTab === 'kyc' || activeTab === 'account') && kyc && (
                  <>
                    <Card
                      title="KYC Status"
                      icon={ShieldCheck}
                      action={<StatusBadge status={kyc.status} />}
                    >
                      {kyc.status === 'rejected' && kyc.rejectionReason && (
                        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                          {kyc.rejectionReason}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Object.entries(kyc.sectionsCompleted || {}).map(
                          ([key, done]) => (
                            <div
                              key={key}
                              className={`rounded-lg border px-3 py-2 text-center text-xs font-medium capitalize ${
                                done
                                  ? 'border-green-200 bg-green-50 text-green-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-500'
                              }`}
                            >
                              {done ? '✓ ' : '○ '}
                              {key}
                            </div>
                          ),
                        )}
                      </div>
                    </Card>
                    <Card title="Identity Documents" icon={IdCard}>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Field
                          label="PAN Number"
                          value={kyc.personal?.panNumber}
                        />
                        <Field
                          label="Aadhaar Number"
                          value={kyc.personal?.aadhaarNumber}
                        />
                        <Field
                          label="Date of Birth"
                          value={kyc.personal?.dateOfBirth?.slice(0, 10)}
                        />
                      </div>
                      {/* <div className="mt-4 flex flex-wrap gap-3">
                        {kyc.personal?.panPhoto && (
                          <a
                            href={kyc.personal.panPhoto}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            View PAN Photo
                          </a>
                        )}
                        {kyc.personal?.aadhaarFront && (
                          <a
                            href={kyc.personal.aadhaarFront}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            View Aadhaar Front
                          </a>
                        )}
                        {kyc.personal?.aadhaarBack && (
                          <a
                            href={kyc.personal.aadhaarBack}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            View Aadhaar Back
                          </a>
                        )}
                      </div> */}
                      <div className="mt-4 flex flex-wrap gap-3">
                        {kyc.personal?.panPhoto && (
                          <a
                            href={kyc.personal.panPhoto}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            View PAN Photo
                          </a>
                        )}
                        {kyc.personal?.aadhaarFront && (
                          <a
                            href={kyc.personal.aadhaarFront}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-14 text-sm font-medium text-blue-600 hover:underline sm:ml-28"
                          >
                            View Aadhaar Front
                          </a>
                        )}
                        {kyc.personal?.aadhaarBack && (
                          <a
                            href={kyc.personal.aadhaarBack}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            View Aadhaar Back
                          </a>
                        )}
                      </div>
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {isKycBankModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex shrink-0 items-center justify-between px-5 pt-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Bank Account
              </h3>
              <button
                type="button"
                onClick={() => setIsKycBankModalOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-800">
                    Account Holder Name
                  </label>
                  <input
                    value={kycBankForm.accountHolderName}
                    onChange={(e) =>
                      setKycBankForm((p) => ({
                        ...p,
                        accountHolderName: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-800">
                      Account Number
                    </label>
                    <input
                      value={kycBankForm.accountNumber}
                      onChange={(e) =>
                        setKycBankForm((p) => ({
                          ...p,
                          accountNumber: e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 18),
                        }))
                      }
                      inputMode="numeric"
                      maxLength={18}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-800">
                      Confirm Account Number
                    </label>
                    <input
                      value={kycBankForm.confirmAccountNumber}
                      onChange={(e) =>
                        setKycBankForm((p) => ({
                          ...p,
                          confirmAccountNumber: e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 18),
                        }))
                      }
                      inputMode="numeric"
                      maxLength={18}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-800">
                    IFSC Code
                  </label>
                  <input
                    value={kycBankForm.ifscCode}
                    onChange={(e) =>
                      setKycBankForm((p) => ({
                        ...p,
                        ifscCode: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, '')
                          .slice(0, 11),
                      }))
                    }
                    maxLength={11}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-800">
                    Cancelled Cheque{' '}
                    {/* <span className="text-xs font-normal text-gray-500">
                    (leave empty to keep existing)
                  </span> */}
                  </label>
                  {kycBankForm.cancelledCheque instanceof File ? (
                    <img
                      src={URL.createObjectURL(kycBankForm.cancelledCheque)}
                      alt="New cheque preview"
                      className="h-28 w-full rounded-lg border border-gray-200 object-cover"
                    />
                  ) : kyc?.bank?.cancelledCheque ? (
                    <button
                      type="button"
                      onClick={() => setViewChequeUrl(kyc.bank.cancelledCheque)}
                      className="flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                    >
                      {String(kyc.bank.cancelledCheque)
                        .toLowerCase()
                        .includes('.pdf') ? (
                        <span className="text-sm font-medium text-blue-600">
                          View current cheque (PDF)
                        </span>
                      ) : (
                        <img
                          src={kyc.bank.cancelledCheque}
                          alt="Current cheque"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setKycBankForm((p) => ({
                        ...p,
                        cancelledCheque: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={kycBankForm.isDefault}
                    onChange={(e) =>
                      setKycBankForm((p) => ({
                        ...p,
                        isDefault: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Set as default account
                </label>
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsKycBankModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={kycBankSaving}
                onClick={handleSaveKycBankDetails}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {kycBankSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isBankModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex shrink-0 items-center justify-between px-5 pt-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBankId ? 'Edit Bank Account' : 'Add Bank Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 pt-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-800">
                    Account Holder Name
                  </label>
                  <input
                    value={bankForm.accountHolderName}
                    onChange={(e) =>
                      setBankForm((p) => ({
                        ...p,
                        accountHolderName: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-800">
                      Account Number
                    </label>
                    <input
                      value={bankForm.accountNumber}
                      onChange={(e) =>
                        setBankForm((p) => ({
                          ...p,
                          accountNumber: e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 18),
                        }))
                      }
                      inputMode="numeric"
                      maxLength={18}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-800">
                      Confirm Account Number
                    </label>
                    <input
                      value={bankForm.confirmAccountNumber}
                      onChange={(e) =>
                        setBankForm((p) => ({
                          ...p,
                          confirmAccountNumber: e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 18),
                        }))
                      }
                      inputMode="numeric"
                      maxLength={18}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-800">
                    IFSC Code
                  </label>
                  <input
                    value={bankForm.ifscCode}
                    onChange={(e) =>
                      setBankForm((p) => ({
                        ...p,
                        ifscCode: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, '')
                          .slice(0, 11),
                      }))
                    }
                    maxLength={11}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-800">
                    Cancelled Cheque{' '}
                    {editingBankId && (
                      <span className="text-xs font-normal text-gray-500">
                        (leave empty to keep existing)
                      </span>
                    )}
                  </label>
                  {bankForm.cancelledCheque instanceof File ? (
                    <img
                      src={URL.createObjectURL(bankForm.cancelledCheque)}
                      alt="New cheque preview"
                      className="h-28 w-full rounded-lg border border-gray-200 object-cover"
                    />
                  ) : bankForm.existingChequeUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        setViewChequeUrl(bankForm.existingChequeUrl)
                      }
                      className="flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                    >
                      {String(bankForm.existingChequeUrl)
                        .toLowerCase()
                        .includes('.pdf') ? (
                        <span className="text-sm font-medium text-blue-600">
                          View current cheque (PDF)
                        </span>
                      ) : (
                        <img
                          src={bankForm.existingChequeUrl}
                          alt="Current cheque"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setBankForm((p) => ({
                        ...p,
                        cancelledCheque: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={bankForm.isDefault}
                    onChange={(e) =>
                      setBankForm((p) => ({
                        ...p,
                        isDefault: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Set as default account
                </label>
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bankSaving}
                onClick={handleSaveBankAccount}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {bankSaving ? 'Saving...' : 'Save Bank Account'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {viewChequeUrl ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setViewChequeUrl('')}
          role="presentation"
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <a
                href={viewChequeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Open in new tab
              </a>
              <button
                type="button"
                onClick={() => setViewChequeUrl('')}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {String(viewChequeUrl).toLowerCase().includes('.pdf') ? (
                <object
                  data={viewChequeUrl}
                  type="application/pdf"
                  className="h-[70vh] w-full rounded-lg border border-gray-200"
                >
                  <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-center">
                    <p className="text-sm text-gray-600">
                      Preview isn&apos;t available for this file.
                    </p>
                    <a
                      href={viewChequeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Open in new tab
                    </a>
                  </div>
                </object>
              ) : (
                <img
                  src={viewChequeUrl}
                  alt="Cancelled cheque"
                  className="max-h-[70vh] w-full rounded-lg object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
              )}
              <div className="hidden h-[70vh] w-full flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-center">
                <p className="text-sm text-gray-600">
                  Preview isn&apos;t available for this file.
                </p>
                <a
                  href={viewChequeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Settings;
