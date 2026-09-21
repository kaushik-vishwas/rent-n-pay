// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSelector } from 'react-redux';
// import { apiGetProductApprovalQueue } from '@/service/api';

// const AdminTopbar = ({ title = 'Admin Dashboard' }) => {
//   const adminUser = useSelector((state) => state.admin.user);
//   const router = useRouter();
//   const [notifCount, setNotifCount] = useState(0);

//   const adminEmail = useMemo(() => {
//     if (adminUser?.email) return adminUser.email;
//     if (typeof window !== 'undefined') {
//       try {
//         const stored = JSON.parse(localStorage.getItem('adminUser') || 'null');
//         return stored?.email || 'admin@rentnpay.com';
//       } catch {
//         return 'admin@rentnpay.com';
//       }
//     }
//     return 'admin@rentnpay.com';
//   }, [adminUser]);

//   const avatarLetter = (adminEmail?.trim()?.[0] || 'A').toUpperCase();

//   useEffect(() => {
//     const token =
//       typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
//     if (!token) return;
//     let mounted = true;
//     const load = async () => {
//       try {
//         const { data } = await apiGetProductApprovalQueue(token, {
//           status: 'pending',
//           limit: 30,
//         });
//         if (!mounted) return;
//         const list = Array.isArray(data?.queue) ? data.queue : [];
//         const items = list.slice(0, 10);
//         const lastSeen = Number(
//           sessionStorage.getItem('admin_last_seen_notif_ts') || 0,
//         );
//         const unread = items.filter(
//           (x) => new Date(x.createdAt || 0).getTime() > lastSeen,
//         ).length;
//         setNotifCount(unread);
//       } catch (error) {
//         if (!mounted) return;
//         setNotifCount(0);
//       }
//     };
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const handleNotifClick = () => {
//     sessionStorage.setItem('admin_last_seen_notif_ts', String(Date.now()));
//     setNotifCount(0);
//     router.push('/dashboard');
//   };

//   return (
//     <header className="flex items-center justify-between pl-14 md:pl-6 pr-3 sm:pr-4 md:pr-6 py-3 md:py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
//       <div className="min-w-0">
//         <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
//           {title}
//         </h1>
//         <p className="hidden sm:block text-xs md:text-sm text-gray-500">
//           {/* Real-time platform health &amp; operations */}
//         </p>
//       </div>
//       <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
//         <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm">
//           <span className="w-2 h-2 rounded-full bg-green-500" />
//           Live
//         </button>
//         <button
//           onClick={handleNotifClick}
//           className="relative w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:border-gray-300"
//         >
//           <span className="sr-only">Notifications</span>
//           <svg
//             className="w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={1.8}
//               d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//             />
//           </svg>
//           {notifCount > 0 ? (
//             <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
//               {notifCount > 9 ? '9+' : notifCount}
//             </span>
//           ) : null}
//         </button>
//         <div className="hidden lg:flex items-center gap-2">
//           <div className="text-right">
//             <p className="text-xs font-medium text-gray-700">{adminEmail}</p>
//           </div>
//           <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
//             {avatarLetter}
//           </div>
//         </div>
//         <div className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
//           {avatarLetter}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default AdminTopbar;

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { apiGetProductApprovalQueue } from '@/service/api';
import {
  LayoutDashboard,
  LineChart,
  ShoppingCart,
  MapPin,
  Activity,
  Radar,
  ShieldCheck,
  UserCheck,
  Tag,
  Boxes,
  Users,
  UserCircle,
  Store,
  ShoppingBag,
  Heart,
  ClipboardList,
  BellRing,
  Wallet,
  Share2,
  Percent,
  FileText,
  TrendingUp,
  Landmark,
  ArrowRightLeft,
  ListChecks,
  Ticket,
  CheckCircle2,
  Star,
  BadgePercent,
  FolderTree,
  Settings2,
  Image as ImageIcon,
  Megaphone,
  RotateCcw,
  Contact,
  LucideBadgePercent,
  UserRound,
  CircleX,
  Settings,
  // Gift,
} from 'lucide-react';

const AdminTopbar = ({ title = 'Admin Dashboard' }) => {
  const adminUser = useSelector((state) => state.admin.user);
  const router = useRouter();
  const pathname = usePathname();
  const [notifCount, setNotifCount] = useState(0);

  const pageTitles = [
    // --- specific child routes first (must come before their parent) ---
    {
      match: '/analytics/financial-performance',
      label: 'Financial Performance',
      subtitle: 'Data-driven insights & commission analytics',
      icon: LineChart,
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      match: '/analytics/order-analytics',
      label: 'Order Analytics',
      subtitle: 'Track and manage your order operations',
      icon: ShoppingCart,
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      match: '/settings',
      label: 'Account Settings',
      subtitle: 'Manage your account settings and preferences',
      icon: Settings,
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      match: '/analytics/cities',
      label: 'Cities',
      subtitle: 'Manage service availability across cities',
      icon: MapPin,
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      match: '/analytics/life-line',
      label: 'Life Line',
      subtitle: 'User tenure distribution',
      icon: Activity,
      gradient: 'from-rose-500 to-pink-500',
    },
    {
      match: '/analytics/zone-perfomance',
      label: 'Geographic Insights',
      subtitle: 'Real-time demand mapping & vendor distribution',
      icon: Radar,
      gradient: 'from-purple-500 to-indigo-500',
    },

    {
      match: '/kyc/vendor',
      label: 'Onboarding Queue',
      subtitle: 'Vendor verification & risk assessment workflow',
      icon: ShieldCheck,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      match: '/kyc/customer',
      label: 'Customer KYC',
      subtitle: 'Review and verify customer identity documents',
      icon: UserCheck,
      gradient: 'from-orange-500 to-red-500',
    },

    {
      match: '/global-products',
      label: 'Global Product Inventory',
      subtitle: 'Manage all product listings across vendors',
      icon: Boxes,
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      match: '/products-offers',
      label: 'Products & Offers',
      subtitle: 'Switch between offer management and global product inventory',
      icon: Tag,
      gradient: 'from-fuchsia-500 to-pink-500',
    },

    {
      match: '/finances/settlements',
      label: 'Settlements Management',
      subtitle: 'Track and manage vendor payouts and settlement cycles',
      icon: Wallet,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      match: '/finances/cancellations',
      label: 'Cancellations Management',
      subtitle: 'Track and manage Cancellations',
      icon: CircleX,
      gradient: 'from-red-500 to-rose-400',
    },
    {
      match: '/finances/referrals',
      label: 'Referral Genealogy & Activity',
      subtitle: 'Track referrer networks with expandable referees list',
      icon: Share2,
      gradient: 'from-sky-500 to-cyan-500',
    },
    {
      match: '/finances/tax',
      label: 'Global Tax & Protection Setup',
      subtitle: 'Set up global taxes and protection charges',
      icon: Percent,
      gradient: 'from-slate-500 to-gray-600',
    },
    {
      match: '/finances/systeminvoice',
      label: 'System Invoice',
      subtitle: 'Financial archive for receipts, commissions, and payouts',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      match: '/system/contact-enquiries',
      label: 'Contact Enquiries',
      subtitle: 'Manage customer enquiries and messages',
      icon: Contact,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      match: '/finances/growth-plan',
      label: 'Growth Plans Dashboard',
      subtitle:
        'Monitor ad performance, subscription slots, and revenue metrics',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      match: '/finances/transaction',
      label: 'Transaction Summary',
      subtitle: 'Recent payouts and settlement history',
      icon: ArrowRightLeft,
      gradient: 'from-blue-500 to-blue-400',
    },
    {
      match: '/finances/bank-verification',
      label: 'Vendor Bank Verification',
      subtitle: 'Review and approve or reject vendor bank account submissions',
      icon: Landmark,
      gradient: 'from-yellow-500 to-amber-500',
    },

    {
      match: '/finances/refunds',
      label: 'Refund Management',
      subtitle: 'Track and manage Refund Transactions.',
      icon: RotateCcw,
      gradient: 'from-orange-500 to-orange-400',
    },

    {
      match: '/system/tickets',
      label: 'Customer Queries',
      subtitle: 'Manage and resolve customer support tickets',
      icon: Ticket,
      gradient: 'from-red-500 to-rose-500',
    },
    {
      match: '/system/rent-offer',
      label: 'Rent Offers',
      subtitle: 'Manage rental offers and promotions',
      icon: LucideBadgePercent,
      gradient: 'from-red-500 to-rose-500',
    },
    {
      match: '/system/rent-as-banners',
      label: 'RentAs Per Banners',
      subtitle: 'Manage RentAs Per needs banners',
      icon: LucideBadgePercent,
      gradient: 'from-red-500 to-rose-500',
    },
    {
      match: '/system/buy-advertisements',
      label: 'Buy Advertisement',
      subtitle: 'Manage buy promotional advertisements',
      icon: Megaphone,
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      match: '/system/service-advertisements',
      label: 'Service Advertisement',
      subtitle: 'Manage Service promotional advertisements',
      icon: Megaphone,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      match: '/system/featured',
      label: 'Featured Products',
      subtitle:
        'Manage priority rankings and visibility of featured products and services',
      icon: Star,
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      match: '/system/coupons',
      label: 'Coupon & Promotion Manager',
      subtitle: 'Manage all promotional codes and track redemption performance',
      icon: BadgePercent,
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      match: '/system/approval',
      label: 'Product Approval',
      subtitle:
        'Review and approve vendor product submissions for marketplace listing',
      icon: CheckCircle2,
      gradient: 'from-green-500 to-lime-500',
    },
    {
      match: '/system/refund-approval',
      label: 'Refund Approval',
      subtitle: 'Review vendor-inspected returns',
      icon: CheckCircle2,
      gradient: 'from-red-500 to-red-400',
    },
    {
      match: '/system/subadmin-approval',
      label: 'Sub Admins',
      subtitle: 'Manage and approve sub-admin accounts',
      icon: UserRound,
      gradient: 'from-sky-500 to-cyan-400',
    },
    {
      match: '/system/commission',
      label: 'Commission & GST Setup',
      subtitle:
        'Configure platform commission rates and GST for each tenure slot',
      icon: Settings2,
      gradient: 'from-gray-500 to-slate-600',
    },
    {
      match: '/system/banners',
      label: 'Banners',
      subtitle: 'Manage rome-rent-buy banners',
      icon: ImageIcon,
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      match: '/system/advertisements',
      label: 'Advertisements',
      subtitle: 'Manage homepage promotional ads',
      icon: Megaphone,
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      match: '/custom-listings',
      label: 'Custom Listings',
      subtitle: 'Manage your Custom Listing Products',
      icon: ListChecks,
      gradient: 'from-indigo-500 to-violet-500',
    },
    {
      match: '/categories',
      label: 'Master Categories',
      subtitle: 'Organize product hierarchy and manage category settings',
      icon: FolderTree,
      gradient: 'from-teal-500 to-cyan-500',
    },

    {
      match: '/all-vendors',
      label: 'All Partners & Vendors',
      subtitle: 'Manage vendor profiles, verification status, and inventory',
      icon: Users,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      match: '/users',
      label: 'Customers',
      subtitle: 'Track customer lifecycle with dynamic platform data',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      match: '/stores',
      label: 'All Physical Stores & Warehouses',
      subtitle:
        'Manage store visibility, service radius, and operational status',
      icon: Store,
      gradient: 'from-emerald-500 to-green-500',
    },
    // {
    //   match: '/welcome-kit',
    //   label: 'Welcome Kit',
    //   subtitle: 'Vendor sizing details for welcome kit dispatch',
    //   icon: Gift,
    //   gradient: 'from-emerald-500 to-green-500',
    // },
    {
      match: '/cart',
      label: 'Shopping Cart',
      subtitle: 'View and manage customer shopping carts across the platform',
      icon: ShoppingCart,
      gradient: 'from-cyan-500 to-sky-500',
    },
    {
      match: '/wishlist',
      label: 'Global Wishlist Analytics',
      subtitle:
        'Track trending products, customer preferences, and conversion opportunities',
      icon: Heart,
      gradient: 'from-pink-500 to-red-500',
    },
    {
      match: '/orders',
      label: 'Orders',
      subtitle: 'Read-only view of all customer orders',
      icon: ClipboardList,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      match: '/reminders',
      label: 'Reminders & Expiry Tracking',
      subtitle:
        'Monitor upcoming rental expirations and investor payout schedules',
      icon: BellRing,
      gradient: 'from-amber-500 to-yellow-500',
    },

    // --- parent/group fallbacks (must come after children) ---
    {
      match: '/dashboard',
      label: 'Dashboard',
      subtitle: 'Real-time platform health & operations overview',
      icon: LayoutDashboard,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      match: '/analytics',
      label: 'Analytics',
      subtitle: '',
      icon: LineChart,
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      match: '/kyc',
      label: 'KYC',
      subtitle: '',
      icon: ShieldCheck,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      match: '/finances',
      label: 'Finances',
      subtitle: '',
      icon: Wallet,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      match: '/system',
      label: 'System',
      subtitle: '',
      icon: Settings2,
      gradient: 'from-gray-500 to-slate-600',
    },
  ];

  const matchedPage = pageTitles.find((p) => pathname?.startsWith(p.match));
  const derivedTitle = matchedPage?.label || title;
  const derivedSubtitle = matchedPage?.subtitle || '';
  const DerivedIcon = matchedPage?.icon || LayoutDashboard;
  const derivedGradient = matchedPage?.gradient || 'from-orange-500 to-red-500';

  const adminEmail = useMemo(() => {
    if (adminUser?.email) return adminUser.email;
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('adminUser') || 'null');
        return stored?.email || 'admin@rentnpay.com';
      } catch {
        return 'admin@rentnpay.com';
      }
    }
    return 'admin@rentnpay.com';
  }, [adminUser]);

  const avatarLetter = (adminEmail?.trim()?.[0] || 'A').toUpperCase();

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) return;
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await apiGetProductApprovalQueue(token, {
          status: 'pending',
          limit: 30,
        });
        if (!mounted) return;
        const list = Array.isArray(data?.queue) ? data.queue : [];
        const items = list.slice(0, 10);
        const lastSeen = Number(
          sessionStorage.getItem('admin_last_seen_notif_ts') || 0,
        );
        const unread = items.filter(
          (x) => new Date(x.createdAt || 0).getTime() > lastSeen,
        ).length;
        setNotifCount(unread);
      } catch (error) {
        if (!mounted) return;
        setNotifCount(0);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleNotifClick = () => {
    sessionStorage.setItem('admin_last_seen_notif_ts', String(Date.now()));
    setNotifCount(0);
    router.push('/dashboard');
  };

  return (
    // <header className="flex items-center justify-between pl-14 md:pl-6 pr-3 sm:pr-4 md:pr-6 py-3 md:py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
    <header className="flex items-center justify-between pl-14 md:pl-6 pr-3 sm:pr-4 md:pr-6 py-3 md:py-4 border-b border-gray-200 bg-white sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        {/* <div
            className={`hidden sm:flex w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br ${derivedGradient} items-center justify-center shrink-0 shadow-sm`}
          > */}
        <div
          className={`flex w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${derivedGradient} items-center justify-center shrink-0 shadow-sm`}
        >
          {/* <DerivedIcon
              className="w-5 h-5 md:w-6 md:h-6 text-white"
              strokeWidth={2}
            /> */}
          <DerivedIcon
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white"
            strokeWidth={2}
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
            {derivedTitle}
          </h1>
          {/* {derivedSubtitle ? (
              <p className="hidden sm:block text-xs md:text-sm text-gray-500 truncate">
                {derivedSubtitle}
              </p>
            ) : null} */}
          {derivedSubtitle ? (
            <p className="block text-[11px] sm:text-xs md:text-sm text-gray-500 truncate">
              {derivedSubtitle}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm">
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-green-500" />
            </span>
            Live
          </button> */}
        {/* <button
            onClick={handleNotifClick}
            className="relative w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            <span className="sr-only">Notifications</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {notifCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            ) : null}
          </button> */}
        {/* <div className="hidden lg:flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-medium text-gray-700">{adminEmail}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
            {avatarLetter}
          </div>
        </div>
        <div className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
          {avatarLetter}
        </div> */}
        {adminUser?.role === 'admin' ? (
          <button
            onClick={() => router.push('/settings')}
            className="hidden lg:flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="text-right">
              <p className="text-xs font-medium text-gray-700">{adminEmail}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
              {avatarLetter}
            </div>
          </button>
        ) : (
          <div className="hidden lg:flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-700">{adminEmail}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
              {avatarLetter}
            </div>
          </div>
        )}
        {adminUser?.role === 'admin' ? (
          <button
            onClick={() => router.push('/settings')}
            className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            {avatarLetter}
          </button>
        ) : (
          <div className="lg:hidden w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
            {avatarLetter}
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminTopbar;
