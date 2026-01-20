'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="glass mx-auto mt-4 max-w-7xl flex items-center justify-between px-6 py-4 rounded-full">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-2xl font-bold tracking-tighter">
              NEXT NEW <span className="text-accent italic">FACE</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Process
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Technology
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          <Link
            href="/login"
            className="bg-white text-black text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full hover:bg-zinc-200 transition-colors"
          >
            Get Early Access
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-model.png"
              alt="Fashion portrait"
              fill
              className="object-cover object-top opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="inline-block mb-6 px-4 py-1 border border-white/20 rounded-full backdrop-blur-sm">
              <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium text-white/70">
                Precision Talent Discovery Platform
              </span>
            </div>

            <h1 className="font-editorial text-5xl md:text-8xl lg:text-9xl mb-8 leading-[1] tracking-tight text-white italic">
              Find the Next New Face{' '}
              <span className="block not-italic text-white/90">Before Anyone Else</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed font-light">
              Next New Face scans millions of profiles to find unsigned talent with
              model potential — so your agency can reach them first.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-accent text-white px-10 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_-10px_rgba(59,130,246,0.6)]"
              >
                Start Discovering
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto glass text-white px-10 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                See How it Works
              </a>
            </div>

            <div className="mt-16 flex items-center justify-center gap-10">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <Image
                    key={i}
                    src={`https://picsum.photos/seed/${i + 20}/100/100?grayscale`}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-black"
                    alt="Discovered model"
                  />
                ))}
              </div>
              <p className="text-zinc-500 text-sm font-light">
                <span className="text-white font-medium">500+</span> models discovered
                this month
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <div className="py-12 border-y border-white/5 bg-black/50">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-center text-zinc-600 mb-8">
              Trusted by top agencies in world capitals
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
              {['NYC', 'PARIS', 'MILAN', 'LONDON', 'LA', 'TOKYO'].map((city) => (
                <div key={city} className="flex flex-col items-center">
                  <span className="font-editorial text-2xl md:text-3xl font-bold tracking-tighter text-white">
                    {city}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Problem / Solution */}
        <section className="py-24 md:py-40 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="font-editorial text-4xl md:text-6xl mb-8 italic">
                Stop Scrolling. <br />
                <span className="not-italic text-zinc-500">Start Scouting.</span>
              </h2>
              <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                The traditional way of scouting is broken. Thousands of man-hours are
                wasted manually scrolling through hashtags, hoping to find a
                &quot;diamond in the rough.&quot;
              </p>
              <div className="space-y-4">
                {[
                  'Missed talent because of time zone differences',
                  'Relying on luck and manual discovery',
                  'Inefficient outreach to already signed models',
                  'Inconsistent data on physical attributes',
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-zinc-500">
                    <span className="text-red-900/50">✕</span>
                    <span className="text-sm font-light uppercase tracking-widest">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 md:p-12 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl group-hover:bg-accent/40 transition-colors"></div>
              <h3 className="text-2xl font-editorial italic mb-6">
                The Next New Face Advantage
              </h3>
              <p className="text-zinc-400 mb-8 font-light">
                We use computer vision and predictive analytics to identify
                individuals with model-grade characteristics across Instagram and
                TikTok before they enter the industry.
              </p>
              <ul className="space-y-6">
                {[
                  {
                    title: 'Predictive Potential Score',
                    desc: 'AI analysis of bone structure, symmetry, and marketability.',
                  },
                  {
                    title: 'Unsigned Filtering',
                    desc: 'Proprietary logic detects if a talent is already represented by competitors.',
                  },
                  {
                    title: 'Global 24/7 Scanning',
                    desc: 'Our scouts never sleep, covering every timezone and niche community.',
                  },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent flex items-center justify-center mt-1">
                      <span className="text-[10px]">✓</span>
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-1">
                        {item.title}
                      </h4>
                      <p className="text-zinc-500 text-xs">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-zinc-950 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-editorial text-4xl md:text-6xl mb-6 italic">
                The Discovery Engine
              </h2>
              <p className="text-zinc-500 font-light max-w-xl mx-auto uppercase tracking-widest text-xs">
                Transforming intuition into a scalable data-driven pipeline.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  number: '01',
                  title: 'Set Your Look',
                  desc: "Define your requirements: height, age, location, and 'look' type (editorial, commercial, high fashion).",
                  img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
                },
                {
                  number: '02',
                  title: 'AI Analysis',
                  desc: "Next New Face scans millions of profiles hourly, scoring candidates based on your agency's historical signing success.",
                  img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800',
                },
                {
                  number: '03',
                  title: 'Sign Talent',
                  desc: 'Review scored portfolios, check authenticity metrics, and reach out directly with one-click templates.',
                  img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
                },
              ].map((step, idx) => (
                <div key={idx} className="group cursor-default">
                  <div className="relative overflow-hidden aspect-[3/4] rounded-2xl mb-8">
                    <Image
                      src={step.img}
                      alt={step.title}
                      fill
                      className="object-cover grayscale brightness-50 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-75 transition-all duration-700"
                    />
                    <div className="absolute top-6 left-6 font-editorial text-4xl text-white/50">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-widest mb-4">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div>
                <span className="text-accent text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
                  Technology
                </span>
                <h2 className="font-editorial text-4xl md:text-6xl italic">
                  Intelligence at Scale
                </h2>
              </div>
              <p className="max-w-md text-zinc-500 font-light italic leading-relaxed">
                We don&apos;t just find people. We find the specific people who will
                build your agency&apos;s next decade of success.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Multi-Platform Scouting',
                  desc: 'Unified pipeline for discovery across Instagram, TikTok, and emerging platforms.',
                  icon: '🌐',
                },
                {
                  title: 'Deep Authenticity Score',
                  desc: 'Analyze engagement rates and bot activity to ensure talent has real influence.',
                  icon: '🛡️',
                },
                {
                  title: 'Attribute Extraction',
                  desc: 'Automatically estimate height, build, and skin tones from multiple images.',
                  icon: '📏',
                },
                {
                  title: 'CRM Integration',
                  desc: 'Manage your scouting funnel from first contact to signed contract.',
                  icon: '📊',
                },
                {
                  title: 'One-Click Outreach',
                  desc: 'Personalized DM and email templates designed to convert.',
                  icon: '✉️',
                },
                {
                  title: 'Historical Context',
                  desc: "Compare new faces against your agency's past 10 years of successful signings.",
                  icon: '🕰️',
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="glass p-8 rounded-3xl hover:bg-white/[0.05] transition-colors border-white/5 group"
                >
                  <div className="text-3xl mb-6 group-hover:scale-125 transition-transform duration-500 block w-fit">
                    {f.icon}
                  </div>
                  <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-4">
                    {f.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-light">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 bg-navy px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-blue-500/10 blur-[120px] rounded-full"></div>

          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <span className="text-accent text-5xl font-editorial mb-8 block leading-none">
              &quot;
            </span>
            <blockquote className="font-editorial text-3xl md:text-5xl italic leading-tight text-white mb-10">
              Next New Face found three of our biggest new faces in the first two
              weeks. We would have never discovered a farm girl from North Dakota
              without this tool. It&apos;s the industry&apos;s best kept secret.
            </blockquote>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-accent">
                <Image
                  src="https://picsum.photos/seed/fashionbooker/100/100?grayscale"
                  alt="Booker Portrait"
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <cite className="not-italic">
                <span className="block text-white font-bold uppercase tracking-widest text-xs">
                  Marcello Rossi
                </span>
                <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mt-1">
                  Head of Scouting, Elite Models New Faces
                </span>
              </cite>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 md:py-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-editorial text-4xl md:text-6xl italic mb-6">
                Invest in the Future
              </h2>
              <p className="text-zinc-500 font-light text-xs uppercase tracking-[0.3em]">
                Scalable solutions for every agency size.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="glass p-10 md:p-16 rounded-[3rem] border-white/10 hover:border-accent/30 transition-colors">
                <h3 className="font-editorial text-3xl italic mb-4">Mother Agency</h3>
                <p className="text-zinc-500 text-sm mb-10 font-light">
                  Perfect for growing agencies in secondary markets.
                </p>
                <div className="text-5xl font-editorial mb-10">
                  $850{' '}
                  <span className="text-lg text-zinc-500 font-light not-italic">
                    /month
                  </span>
                </div>
                <ul className="space-y-4 mb-12">
                  {[
                    'Daily Profile Scanning',
                    '500 Scored Leads/Mo',
                    'Basic CRM Features',
                    'Email Support',
                  ].map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-3 text-zinc-400 text-sm font-light"
                    >
                      <span className="text-accent">●</span> {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block w-full py-4 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all text-center"
                >
                  Request Access
                </Link>
              </div>

              <div className="bg-white text-black p-10 md:p-16 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-accent text-white px-8 py-2 text-[10px] font-bold uppercase tracking-widest transform translate-x-4 translate-y-4 rotate-45 shadow-lg">
                  Most Popular
                </div>
                <h3 className="font-editorial text-3xl italic mb-4">International</h3>
                <p className="text-zinc-800/70 text-sm mb-10 font-light">
                  The standard for world-class scouting divisions.
                </p>
                <div className="text-5xl font-editorial mb-10">
                  $2,400{' '}
                  <span className="text-lg text-zinc-800/50 font-light not-italic">
                    /month
                  </span>
                </div>
                <ul className="space-y-4 mb-12">
                  {[
                    'Real-time Scanning',
                    'Unlimited Leads',
                    'Full Pipeline CRM',
                    'Physical Attribute Extraction',
                    'Priority Support',
                  ].map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-3 text-zinc-800 text-sm font-medium"
                    >
                      <span className="text-accent">●</span> {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block w-full py-4 rounded-full bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-2xl text-center"
                >
                  Start Discovering
                </Link>
              </div>
            </div>

            <div className="mt-20 text-center">
              <p className="text-zinc-600 text-xs font-light uppercase tracking-widest">
                Need a custom enterprise solution?{' '}
                <a href="#" className="text-white hover:underline">
                  Contact our concierge team
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="font-editorial text-3xl font-bold tracking-tighter mb-6">
              NEXT NEW <span className="text-accent italic">FACE</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-light">
              The next generation of talent discovery, built for the modern fashion
              industry. Powered by advanced computer vision and predictive
              intelligence.
            </p>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-6">
              Platform
            </h4>
            <ul className="space-y-4">
              {['Process', 'Technology', 'Case Studies', 'Pricing'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-zinc-500 hover:text-white transition-colors text-xs font-light uppercase tracking-widest"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-zinc-500 hover:text-white transition-colors text-xs font-light uppercase tracking-widest"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-[10px] font-light uppercase tracking-widest">
            © 2025 Next New Face Inc. All Rights Reserved.
          </p>
          <div className="flex items-center gap-8">
            {['Instagram', 'LinkedIn', 'Twitter'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-zinc-600 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
