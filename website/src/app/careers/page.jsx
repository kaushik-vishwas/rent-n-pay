'use client';

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
  Heart,
  GraduationCap,
  CalendarDays,
  HeartPulse,
  MapPin,
  Briefcase,
  ArrowRight,
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

const perks = [
  {
    icon: HeartPulse,
    title: 'Health cover',
    desc: 'Medical insurance for you and your family, from day one.',
  },
  {
    icon: CalendarDays,
    title: 'Flexible leave',
    desc: 'Take the time you need — we trust you to manage your own calendar.',
  },
  {
    icon: GraduationCap,
    title: 'Learning budget',
    desc: 'Yearly budget for courses, books, and conferences that grow your craft.',
  },
  {
    icon: Heart,
    title: 'Employee discounts',
    desc: 'Rent or buy through Rentnpay yourself, at a team discount.',
  },
];

const departments = [
  {
    dept: 'Engineering',
    roles: [
      {
        title: 'Senior Frontend Engineer',
        location: 'Bengaluru',
        type: 'Full-time',
      },
      {
        title: 'Backend Engineer — Payments',
        location: 'Bengaluru',
        type: 'Full-time',
      },
      { title: 'QA Engineer', location: 'Remote', type: 'Full-time' },
    ],
  },
  {
    dept: 'Product & Design',
    roles: [
      { title: 'Product Designer', location: 'Bengaluru', type: 'Full-time' },
      {
        title: 'Product Manager — Rentals',
        location: 'Bengaluru',
        type: 'Full-time',
      },
    ],
  },
  {
    dept: 'Operations',
    roles: [
      {
        title: 'City Operations Manager',
        location: 'Mumbai',
        type: 'Full-time',
      },
      {
        title: 'Delivery & Logistics Associate',
        location: 'Pune',
        type: 'Full-time',
      },
    ],
  },
  {
    dept: 'Customer Support',
    roles: [
      { title: 'Support Executive', location: 'Chennai', type: 'Full-time' },
      { title: 'Support Team Lead', location: 'Chennai', type: 'Full-time' },
    ],
  },
];

const Careers = () => {
  return (
    <main className="w-full bg-white">
      {/* Hero */}
      <section
        className="relative w-full py-10 md:py-14 px-4 overflow-hidden"
        style={{ backgroundColor: 'rgba(249,115,22,0.85)' }}
      >
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
            Careers at Rentnpay
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

      {/* Intro / mission */}
      {/* <section className="max-w-6xl mx-auto px-4 py-14 md:py-20 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-black leading-snug">
          Come build a home for a{' '}
          <span style={{ color: '#F97316' }}>better way</span> to rent.
        </h2>
        <p className="mt-6 text-gray-600 text-sm md:text-base leading-relaxed">
          Rentnpay is a small, fast-moving team solving a problem that touches
          everyone at some point — finding, paying for, and maintaining a home.
          We work in tight loops, ship fast, and care a lot about the people who
          trust us with something as personal as where they live.
        </p>
      </section> */}

      {/* Perks */}
      <section className="bg-[#FFF8F1] py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-black text-center mb-10">
            Why join us
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {perks.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl p-3 md:p-6 shadow-sm border border-orange-100 text-center"
              >
                <div
                  className="w-9 h-9 md:w-12 md:h-12 mx-auto rounded-full flex items-center justify-center mb-2 md:mb-4"
                  style={{ backgroundColor: 'rgba(249,115,22,0.12)' }}
                >
                  <p.icon
                    size={16}
                    className="md:hidden"
                    style={{ color: '#F97316' }}
                  />
                  <p.icon
                    size={22}
                    className="hidden md:block"
                    style={{ color: '#F97316' }}
                  />
                </div>
                <h3 className="text-xs md:text-base font-semibold text-black mb-1 md:mb-2">
                  {p.title}
                </h3>
                <p className="hidden md:block text-xs md:text-sm text-gray-600 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <h2 className="text-xl md:text-2xl font-bold text-black text-center mb-2">
          Open positions
        </h2>
        <p className="text-center text-sm text-gray-500 mb-12">
          Don&apos;t see a fit? Email your resume to careers@rentnpay.com
          anyway.
        </p>

        <div className="space-y-12">
          {departments.map((d) => (
            <div key={d.dept}>
              <h3 className="text-base md:text-lg font-semibold text-black mb-1">
                {d.dept}
              </h3>
              <div
                className="w-10 h-1 mb-4"
                style={{ backgroundColor: '#F97316' }}
              />
              <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
                {d.roles.map((r) => (
                  <div
                    key={r.title}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4"
                  >
                    <div>
                      <p className="text-sm md:text-base font-medium text-black">
                        {r.title}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs md:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {r.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {r.type}
                        </span>
                      </div>
                    </div>
                    <a
                      href="mailto:careers@rentnpay.com"
                      className="inline-flex items-center gap-1 text-sm font-semibold self-start sm:self-auto"
                      style={{ color: '#F97316' }}
                    >
                      Apply
                      <ArrowRight size={16} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      {/* <section
        className="py-14 md:py-20 px-4 text-center"
        style={{ backgroundColor: '#F97316' }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Don&apos;t see the right role?
          </h2>
          <p className="mt-3 text-white/90 text-sm md:text-base">
            We&apos;re always open to meeting people who care about solving this
            problem. Send us your resume and tell us what you&apos;d want to
            work on.
          </p>
          <a
            href="mailto:careers@rentnpay.com"
            className="inline-block mt-6 px-6 py-3 rounded-full bg-white font-semibold text-sm transition-transform hover:scale-105"
            style={{ color: '#F97316' }}
          >
            careers@rentnpay.com
          </a>
        </div>
      </section> */}
    </main>
  );
};

export default Careers;
