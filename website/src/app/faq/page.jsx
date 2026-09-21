'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Armchair,
  WashingMachine,
  Lamp,
  Sofa,
  Refrigerator,
  Bed,
  Tv,
  Microwave,
  AirVent,
  Fan,
  Table2,
  Bath,
  Laptop,
  Monitor,
  Speaker,
  DoorOpen,
  Package,
  Car,
  Bike,
  Dumbbell,
} from 'lucide-react';

const heroIcons = [
  {
    Icon: Sofa,
    top: '2%',
    left: '3%',
    size: 'w-16 h-16 md:w-24 md:h-24',
    rotate: '-8deg',
    delay: '0s',
    duration: '5s',
  },
  {
    Icon: Armchair,
    top: '55%',
    left: '9%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '6deg',
    delay: '0.4s',
    duration: '6s',
  },
  {
    Icon: Bed,
    top: '10%',
    left: '15%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '4deg',
    delay: '0.8s',
    duration: '5.5s',
  },
  {
    Icon: WashingMachine,
    top: '60%',
    left: '20%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '10deg',
    delay: '1.2s',
    duration: '6.5s',
  },
  {
    Icon: Refrigerator,
    top: '5%',
    left: '28%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '-6deg',
    delay: '0.2s',
    duration: '5s',
  },
  {
    Icon: Lamp,
    top: '65%',
    left: '33%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-10deg',
    delay: '1.6s',
    duration: '6s',
  },
  {
    Icon: Tv,
    top: '15%',
    left: '40%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '5deg',
    delay: '0.6s',
    duration: '5.5s',
  },
  {
    Icon: Microwave,
    top: '58%',
    left: '46%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-4deg',
    delay: '1s',
    duration: '6.5s',
  },
  {
    Icon: AirVent,
    top: '3%',
    left: '52%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '8deg',
    delay: '0.3s',
    duration: '5s',
  },
  {
    Icon: Fan,
    top: '62%',
    left: '58%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-8deg',
    delay: '1.4s',
    duration: '6s',
  },
  {
    Icon: Table2,
    top: '8%',
    left: '63%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '6deg',
    delay: '0.7s',
    duration: '5.5s',
  },
  {
    Icon: Bath,
    top: '55%',
    left: '68%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-5deg',
    delay: '1.8s',
    duration: '6.5s',
  },
  {
    Icon: Laptop,
    top: '12%',
    left: '73%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '4deg',
    delay: '0.5s',
    duration: '5s',
  },
  {
    Icon: Monitor,
    top: '60%',
    left: '78%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '-6deg',
    delay: '1.1s',
    duration: '6s',
  },
  {
    Icon: Speaker,
    top: '5%',
    left: '83%',
    size: 'w-10 h-10 md:w-14 md:h-14',
    rotate: '10deg',
    delay: '0.9s',
    duration: '5.5s',
  },
  {
    Icon: DoorOpen,
    top: '58%',
    left: '88%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-8deg',
    delay: '1.3s',
    duration: '6.5s',
  },
  {
    Icon: Package,
    top: '15%',
    left: '92%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '6deg',
    delay: '0.1s',
    duration: '5s',
  },
  {
    Icon: Car,
    top: '75%',
    left: '2%',
    size: 'w-14 h-14 md:w-20 md:h-20',
    rotate: '-4deg',
    delay: '1.7s',
    duration: '6s',
  },
  {
    Icon: Bike,
    top: '80%',
    left: '44%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '8deg',
    delay: '0.5s',
    duration: '5.5s',
  },
  {
    Icon: Dumbbell,
    top: '78%',
    left: '80%',
    size: 'w-12 h-12 md:w-16 md:h-16',
    rotate: '-6deg',
    delay: '1.5s',
    duration: '6.5s',
  },
];

const faqCategories = [
  {
    category: 'Renting',
    items: [
      {
        q: 'How does renting on Rentnpay work?',
        a: 'Browse listings, choose a product, select your rental period, and pay securely to confirm. Delivery or pickup is scheduled right after.',
      },
      {
        q: 'What is the minimum rental period?',
        a: 'Minimum rental duration depends on the listing and is shown on the product or property page before you book — it typically ranges from 1 to 3 months.',
      },
      {
        q: 'Can I extend or end my rental early?',
        a: 'Yes. You can extend a rental anytime from your dashboard, or close it early subject to the notice period and any lock-in terms in your agreement.',
      },
    ],
  },
  {
    category: 'Buying',
    items: [
      {
        q: 'Can I buy a product or property instead of renting?',
        a: 'Yes. Rentnpay lets you buy eligible products or properties directly, with secure online payment and a simple checkout process.',
      },
      {
        q: 'Is there a way to switch from renting to buying later?',
        a: 'Currently, Rentnpay does not support converting a rental into a purchase later. You can return the product and purchase eligible products separately.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods are supported?',
        a: 'Rentnpay accepts UPI, debit/credit cards, net banking, and select wallets for rent, purchases, deposits, and service fees.',
      },
      {
        q: 'What happens if I miss a rent payment?',
        a: "You'll get reminders before the due date. If a payment is missed, late charges as specified in your rental agreement may apply — you can catch up anytime from your dashboard.",
      },
      {
        q: 'When is my security deposit refunded?',
        a: 'Security deposits are refunded within 7–10 business days after your rented item is picked up and inspected, minus any applicable damage or dues.',
      },
    ],
  },
  {
    category: 'Delivery & Services',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Standard delivery takes 2–7 business days depending on your city and product availability — the exact estimate is shown before checkout.',
      },
      {
        q: 'Can I book repairs or cleaning services through Rentnpay?',
        a: 'Yes, our Services marketplace covers repairs, cleaning, and move-in support, handled by verified professionals and bookable in a few taps.',
      },
      {
        q: 'What if my item arrives damaged?',
        a: 'Report it within 48 hours of delivery with photos, and we\u2019ll arrange a free replacement or repair.',
      },
    ],
  },
  {
    category: 'Account & Support',
    items: [
      {
        q: 'How do I contact Rentnpay support?',
        a: 'Reach us anytime through the Help Center in the app, or email support@rentnpay.com — our team typically responds within a few hours.',
      },
      {
        q: 'How do I cancel or reschedule an order?',
        a: 'Go to your Orders or Bookings page to cancel or reschedule directly. Charges, if any, depend on timing — full details are in our Cancellation Policy.',
      },
    ],
  },
];

const FaqItem = ({ q, a, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm md:text-base font-medium text-black">{q}</span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={isOpen ? { color: '#F97316' } : undefined}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-gray-600 leading-relaxed pb-5">{a}</p>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openKey, setOpenKey] = useState('Renting-0');

  return (
    <main className="w-full bg-white">
      {/* Hero */}
      <section
        className="relative w-full py-10 md:py-14 px-4 overflow-hidden"
        style={{ backgroundColor: 'rgba(249,115,22,0.85)' }}
      >
        {/* Faint background product icons */}
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          {heroIcons.map(
            ({ Icon, top, left, size, rotate, delay, duration }, i) => (
              <Icon
                key={i}
                className={`absolute ${size} text-white animate-[floatIcon_ease-in-out_infinite]`}
                style={{
                  top,
                  left,
                  '--rotate': rotate,
                  animationDelay: delay,
                  animationDuration: duration,
                }}
                strokeWidth={1.25}
              />
            ),
          )}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            FAQ&apos;s
          </h1>
        </div>

        <style jsx>{`
          @keyframes floatIcon {
            0% {
              transform: rotate(var(--rotate)) translateY(0px);
            }
            50% {
              transform: rotate(var(--rotate)) translateY(-10px);
            }
            100% {
              transform: rotate(var(--rotate)) translateY(0px);
            }
          }
        `}</style>
      </section>

      {/* FAQ content */}
      <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <div className="space-y-12">
          {faqCategories.map((cat) => (
            <div key={cat.category}>
              <h2 className="text-lg md:text-xl font-semibold text-black mb-1">
                {cat.category}
              </h2>
              <div
                className="w-10 h-1 mb-2"
                style={{ backgroundColor: '#F97316' }}
              />
              <div>
                {cat.items.map((item, idx) => {
                  const key = `${cat.category}-${idx}`;
                  return (
                    <FaqItem
                      key={key}
                      q={item.q}
                      a={item.a}
                      isOpen={openKey === key}
                      onClick={() => setOpenKey(openKey === key ? null : key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default FAQ;
