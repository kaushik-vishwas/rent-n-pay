'use client';

import { useState } from 'react';
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';
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

const categories = [
  'All',
  'Renting Tips',
  'Home & Living',
  'City Guides',
  'Company News',
];

const posts = [
  {
    title: 'Renting vs Buying Furniture: What Actually Saves You Money',
    excerpt:
      'A simple breakdown of the real costs behind owning furniture versus renting it — and when each option makes sense.',
    category: 'Renting Tips',
    date: 'Aug 5, 2026',
    readTime: '6 min read',
    featured: true,
  },
  {
    title: '5 Things to Check Before Signing a Rental Agreement',
    excerpt:
      'From lock-in periods to maintenance clauses, here is what to read carefully before you sign.',
    category: 'Renting Tips',
    date: 'Jul 28, 2026',
    readTime: '4 min read',
  },
  {
    title: 'Setting Up a Home Office in a Rented Apartment',
    excerpt:
      'Practical, landlord-friendly ideas for a productive workspace that leaves no marks behind.',
    category: 'Home & Living',
    date: 'Jul 20, 2026',
    readTime: '5 min read',
  },
  {
    title: 'Moving to Bengaluru: A First-Timer\u2019s Guide to Neighbourhoods',
    excerpt:
      'Where to look depending on your commute, budget, and lifestyle — from Indiranagar to Whitefield.',
    category: 'City Guides',
    date: 'Jul 12, 2026',
    readTime: '8 min read',
  },
  {
    title: 'How We\u2019re Making Rent Payments Faster This Year',
    excerpt:
      'A look at the product changes behind quicker, more reliable rent payments on Rentnpay.',
    category: 'Company News',
    date: 'Jul 3, 2026',
    readTime: '3 min read',
  },
  {
    title: 'Small Apartment, Big Style: Furnishing on a Budget',
    excerpt:
      'How to furnish a compact space without it feeling cramped, using rented pieces you can swap anytime.',
    category: 'Home & Living',
    date: 'Jun 25, 2026',
    readTime: '5 min read',
  },
  {
    title: 'Pune vs Chennai: Comparing Rental Costs in 2026',
    excerpt:
      'A city-by-city look at average rents, deposits, and what tenants are prioritising this year.',
    category: 'City Guides',
    date: 'Jun 18, 2026',
    readTime: '7 min read',
  },
];

const BlogCard = ({ post }) => (
  <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden flex flex-col">
    <div
      className="h-40 w-full flex items-center justify-center"
      style={{ backgroundColor: '#FFF1E4' }}
    >
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ backgroundColor: '#F97316', color: '#fff' }}
      >
        {post.category}
      </span>
    </div>
    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-sm md:text-base font-semibold text-black leading-snug mb-2">
        {post.title}
      </h3>
      <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4 flex-1">
        {post.excerpt}
      </p>
      <div className="flex items-center gap-4 text-[11px] md:text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <CalendarDays size={13} />
          {post.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={13} />
          {post.readTime}
        </span>
      </div>
      <a
        href="#"
        className="inline-flex items-center gap-1 text-sm font-semibold"
        style={{ color: '#F97316' }}
      >
        Read more
        <ArrowRight size={15} />
      </a>
    </div>
  </div>
);

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const featuredPost = posts.find((p) => p.featured);
  const otherPosts = posts.filter((p) => !p.featured);

  const filteredPosts =
    activeCategory === 'All'
      ? otherPosts
      : otherPosts.filter((p) => p.category === activeCategory);

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
            The Rentnpay Blogs
          </h1>
          {/* <p className="mt-3 text-white/90 text-sm md:text-base leading-relaxed">
            Renting tips, home ideas, city guides, and updates from the team.
          </p> */}
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

      {/* Featured post */}
      {/* {featuredPost && (
        <section className="max-w-5xl mx-auto px-4 pt-12 md:pt-16">
          <div className="rounded-3xl overflow-hidden border border-orange-100 shadow-sm grid grid-cols-1 md:grid-cols-2">
            <div
              className="h-48 md:h-auto flex items-center justify-center"
              style={{ backgroundColor: '#FFF1E4' }}
            >
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: '#F97316', color: '#fff' }}
              >
                Featured &middot; {featuredPost.category}
              </span>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <h2 className="text-xl md:text-2xl font-bold text-black leading-snug mb-3">
                {featuredPost.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <CalendarDays size={13} />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {featuredPost.readTime}
                </span>
              </div>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-sm font-semibold w-fit"
                style={{ color: '#F97316' }}
              >
                Read full story
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      )} */}

      {/* Category filters */}
      <section className="max-w-6xl mx-auto px-4 pt-12 md:pt-16">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-xs md:text-sm font-medium border transition-colors"
                style={
                  isActive
                    ? {
                        backgroundColor: '#F97316',
                        color: '#fff',
                        borderColor: '#F97316',
                      }
                    : {
                        backgroundColor: '#fff',
                        color: '#374151',
                        borderColor: '#E5E7EB',
                      }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Post grid */}
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post.title} post={post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-12">
            No posts in this category yet.
          </p>
        )}
      </section>

      {/* Newsletter CTA */}
      {/* <section
        className="py-14 md:py-20 px-4 text-center"
        style={{ backgroundColor: '#F97316' }}
      >
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Get renting tips in your inbox
          </h2>
          <p className="mt-3 text-white/90 text-sm md:text-base">
            One email a month — no spam, just useful stuff.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full text-sm outline-none"
            />
            <button
              className="px-6 py-3 rounded-full bg-white font-semibold text-sm transition-transform hover:scale-105"
              style={{ color: '#F97316' }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section> */}
    </main>
  );
};

export default Blog;
