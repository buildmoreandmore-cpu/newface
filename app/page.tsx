'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-xl md:text-2xl font-bold tracking-tighter text-zinc-900">
              NEXT NEW <span className="text-accent italic">FACE</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-zinc-500">
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">
              Process
            </a>
            <a href="#features" className="hover:text-zinc-900 transition-colors">
              Technology
            </a>
          </nav>

          <Link
            href="/login"
            className="bg-accent text-white text-xs font-bold uppercase tracking-widest px-4 md:px-6 py-2 rounded-full hover:bg-accent/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-gradient-to-b from-zinc-50 to-white">
          {/* Subtle gradient orbs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-zinc-100 rounded-full">
              <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium text-zinc-600">
                Precision Talent Discovery Platform
              </span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-6 md:mb-8 leading-[1.1] tracking-tight text-zinc-900 italic">
              Find the Next New Face{' '}
              <span className="block not-italic text-zinc-400">Before Anyone Else</span>
            </h1>

            <p className="max-w-2xl mx-auto text-base md:text-lg text-zinc-500 mb-8 md:mb-10 leading-relaxed font-light px-4">
              Next New Face scans millions of profiles to find unsigned talent with
              model potential — so your agency can reach them first.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-accent text-white px-8 md:px-10 py-4 md:py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
              >
                Start Discovering
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto bg-zinc-100 text-zinc-700 px-8 md:px-10 py-4 md:py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                See How it Works
              </a>
            </div>

            <div className="mt-12 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-10">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <Image
                    key={i}
                    src={`https://picsum.photos/seed/${i + 20}/100/100`}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-white shadow-sm"
                    alt="Discovered model"
                  />
                ))}
              </div>
              <p className="text-zinc-500 text-sm font-light">
                <span className="text-zinc-900 font-semibold">500+</span> models discovered
                this month
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof - Light theme */}
        <div className="py-12 border-y border-zinc-100 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-center text-zinc-400 mb-8">
              Trusted by top agencies in world capitals
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 lg:gap-24">
              {['NYC', 'PARIS', 'MILAN', 'LONDON', 'LA', 'TOKYO'].map((city) => (
                <div key={city} className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                  <span className="font-editorial text-xl md:text-2xl font-bold tracking-tighter text-zinc-900">
                    {city}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Problem / Solution - Light theme */}
        <section className="py-16 md:py-24 lg:py-40 px-4 md:px-6 bg-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <h2 className="font-editorial text-3xl md:text-4xl lg:text-6xl mb-6 md:mb-8 italic text-zinc-900">
                Stop Scrolling. <br />
                <span className="not-italic text-zinc-400">Start Scouting.</span>
              </h2>
              <p className="text-base md:text-lg text-zinc-500 mb-6 leading-relaxed">
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
                  <div key={idx} className="flex items-center gap-3 text-zinc-400">
                    <span className="text-red-400">✕</span>
                    <span className="text-xs md:text-sm font-light uppercase tracking-widest">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-50 p-6 md:p-8 lg:p-12 rounded-3xl relative overflow-hidden border border-zinc-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl"></div>
              <h3 className="text-xl md:text-2xl font-editorial italic mb-6 text-zinc-900">
                The Next New Face Advantage
              </h3>
              <p className="text-zinc-500 mb-8 font-light text-sm md:text-base">
                We use computer vision and predictive analytics to identify
                individuals with model-grade characteristics across Instagram and
                TikTok before they enter the industry.
              </p>
              <ul className="space-y-6">
                {[
                  {
                    title: 'Predictive Potential Score',
                    desc: 'Advanced analysis of bone structure, symmetry, and marketability.',
                  },
                  {
                    title: 'Unsigned Filtering',
                    desc: 'Proprietary logic detects if a talent is already represented.',
                  },
                  {
                    title: 'Global 24/7 Scanning',
                    desc: 'Our scouts never sleep, covering every timezone and niche community.',
                  },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mt-1 flex-shrink-0">
                      <span className="text-[10px] text-accent">✓</span>
                    </div>
                    <div>
                      <h4 className="text-zinc-900 text-xs md:text-sm font-bold uppercase tracking-widest mb-1">
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

        {/* How It Works - Light theme */}
        <section id="how-it-works" className="py-16 md:py-24 bg-zinc-50 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="font-editorial text-3xl md:text-4xl lg:text-6xl mb-6 italic text-zinc-900">
                The Discovery Engine
              </h2>
              <p className="text-zinc-500 font-light max-w-xl mx-auto uppercase tracking-widest text-xs">
                Transforming intuition into a scalable data-driven pipeline.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  number: '01',
                  title: 'Set Your Look',
                  desc: "Define your requirements: height, age, location, and 'look' type (editorial, commercial, high fashion).",
                  img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
                },
                {
                  number: '02',
                  title: 'Smart Analysis',
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
                  <div className="relative overflow-hidden aspect-[3/4] rounded-2xl mb-6 md:mb-8 shadow-lg">
                    <Image
                      src={step.img}
                      alt={step.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute top-4 md:top-6 left-4 md:left-6 font-editorial text-3xl md:text-4xl text-white/80">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-3 md:mb-4 text-zinc-900">
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

        {/* Features - Light theme */}
        <section id="features" className="py-16 md:py-24 px-4 md:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6 md:gap-8">
              <div>
                <span className="text-accent text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
                  Technology
                </span>
                <h2 className="font-editorial text-3xl md:text-4xl lg:text-6xl italic text-zinc-900">
                  Intelligence at Scale
                </h2>
              </div>
              <p className="max-w-md text-zinc-500 font-light italic leading-relaxed text-sm md:text-base">
                We don&apos;t just find people. We find the specific people who will
                build your agency&apos;s next decade of success.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                  className="bg-zinc-50 p-6 md:p-8 rounded-3xl hover:bg-zinc-100 transition-colors border border-zinc-100 group"
                >
                  <div className="text-2xl md:text-3xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-500 block w-fit">
                    {f.icon}
                  </div>
                  <h3 className="text-zinc-900 text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4">
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

        {/* CTA Section - Light with accent */}
        <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-accent to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <h2 className="font-editorial text-3xl md:text-4xl lg:text-5xl italic leading-tight text-white mb-6">
              Ready to Discover Tomorrow&apos;s Faces Today?
            </h2>
            <p className="text-white/80 text-base md:text-lg mb-8 font-light max-w-2xl mx-auto">
              Join the leading agencies already using Next New Face to stay ahead of the competition.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-white text-accent px-8 md:px-12 py-4 md:py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors shadow-xl"
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </main>

      {/* Footer - Light theme */}
      <footer className="py-16 md:py-20 border-t border-zinc-100 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="sm:col-span-2">
            <div className="font-editorial text-2xl md:text-3xl font-bold tracking-tighter mb-6 text-zinc-900">
              NEXT NEW <span className="text-accent italic">FACE</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-light">
              The next generation of talent discovery, built for the modern fashion
              industry. Powered by advanced computer vision and predictive
              intelligence.
            </p>
          </div>

          <div>
            <h4 className="text-zinc-900 text-[10px] font-bold uppercase tracking-widest mb-6">
              Platform
            </h4>
            <ul className="space-y-4">
              {['Process', 'Technology', 'Case Studies'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-zinc-500 hover:text-zinc-900 transition-colors text-xs font-light uppercase tracking-widest"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-900 text-[10px] font-bold uppercase tracking-widest mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-zinc-500 hover:text-zinc-900 transition-colors text-xs font-light uppercase tracking-widest"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 md:mt-20 pt-8 md:pt-10 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-400 text-[10px] font-light uppercase tracking-widest">
            © 2025 Next New Face Inc. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 md:gap-8">
            {['Instagram', 'LinkedIn', 'Twitter'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-zinc-400 hover:text-zinc-900 transition-colors text-[10px] font-bold uppercase tracking-widest"
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
