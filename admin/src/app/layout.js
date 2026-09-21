// import './globals.css';
// import { Providers } from './providers';
// import Script from 'next/script';

// export const metadata = {
//   title: 'Rentpay Admin',
//   description: 'Rentnpay admin dashboard',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className="antialiased">
//         <Script
//           src="https://checkout.razorpay.com/v1/checkout.js"
//           strategy="beforeInteractive"
//         />
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }

import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';

export const metadata = {
  title: 'Rentpay Admin',
  description: 'Rentnpay admin dashboard',
  icons: {
    icon: [{ url: '/rentnpay-logo.png', type: 'image/png', sizes: '512x512' }],
    shortcut: ['/rentnpay-logo.png'],
    apple: [{ url: '/rentnpay-logo.png', sizes: '512x512' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
