// import { Manrope } from 'next/font/google';
// import './globals.css';
// import { Providers } from '@/providers';
// import Navbar from '@/components/Navbar';
// import Footer from '@/components/Footer';
// import AuthModal from '@/components/AuthModal';
// import Script from 'next/script';
// const manrope = Manrope({
//   subsets: ['latin'],
//   variable: '--font-manrope',
// });

// export const metadata = {
//   title: 'Rentnpay',
//   description: 'Rent and buy products',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body
//         className={`${manrope.variable} min-h-screen flex flex-col font-manrope antialiased bg-white text-gray-900`}
//       >
//         <Script
//           src="https://checkout.razorpay.com/v1/checkout.js"
//           strategy="beforeInteractive"
//         />
//         <Providers>
//           <Navbar />
//           {/* <main className="flex-1">{children}</main> */}
//           <main className="flex-1 flex flex-col">{children}</main>
//           <Footer />
//           <AuthModal />
//         </Providers>
//       </body>
//     </html>
//   );
// }

import { Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import Script from 'next/script';
import GlobalKycReminder from '@/components/GlobalKycReminder.jsx';
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

// export const metadata = {
//   title: 'Rentnpay',
//   description: 'Rent and buy products',
// };
export const metadata = {
  title: 'Rentnpay',
  description: 'Rent and buy products',
  icons: {
    icon: [{ url: '/rentnpay-logo.png', type: 'image/png', sizes: '512x512' }],
    shortcut: ['/rentnpay-logo.png'],
    apple: [{ url: '/rentnpay-logo.png', sizes: '512x512' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} min-h-screen flex flex-col font-manrope antialiased bg-white text-gray-900`}
      >
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <Providers>
          <Navbar />
          {/* <main className="flex-1">{children}</main> */}
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <AuthModal />
          <GlobalKycReminder />
        </Providers>
      </body>
    </html>
  );
}
