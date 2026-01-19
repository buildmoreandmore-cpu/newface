import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Users,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Star,
  Zap,
  Shield,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold">
                <span className="text-lg font-bold text-background">N</span>
              </div>
              <span className="text-xl font-bold tracking-tight">NEWFACE</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gold text-background hover:bg-gold-hover">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
              <Sparkles className="h-4 w-4" />
              AI-Powered Talent Discovery
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Discover Tomorrow&apos;s{' '}
              <span className="text-gradient-gold">Faces</span> Today
            </h1>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              The premium talent scouting platform for elite modeling agencies.
              Leverage AI-powered analysis to identify, evaluate, and sign the next
              generation of fashion icons.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="bg-gold text-background hover:bg-gold-hover px-8">
                  Start Scouting
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-border px-8">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: '50K+', label: 'Talents Discovered' },
              { value: '500+', label: 'Agencies Worldwide' },
              { value: '95%', label: 'Accuracy Rate' },
              { value: '24/7', label: 'AI Analysis' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gold sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Scout Elite Talent
            </h2>
            <p className="mt-4 text-muted-foreground">
              Powerful tools designed for professional modeling agencies
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: 'AI Scoring',
                description:
                  'Advanced AI analyzes profiles and provides marketability scores instantly.',
              },
              {
                icon: Users,
                title: 'Talent Pipeline',
                description:
                  'Track candidates through every stage from discovery to signing.',
              },
              {
                icon: BarChart3,
                title: 'Analytics',
                description:
                  'Deep insights into engagement rates, reach, and growth potential.',
              },
              {
                icon: MessageSquare,
                title: 'Outreach',
                description:
                  'Customizable templates for professional talent outreach.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-gold/50 hover:bg-card/80"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10 text-gold group-hover:bg-gold group-hover:text-background transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How NEWFACE Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three simple steps to revolutionize your talent discovery
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Upload Profiles',
                description:
                  'Import candidate profiles via CSV or add them manually. Support for Instagram, TikTok, and LinkedIn.',
              },
              {
                step: '02',
                title: 'AI Analysis',
                description:
                  'Our AI instantly analyzes each profile, providing detailed scores and actionable insights.',
              },
              {
                step: '03',
                title: 'Manage Pipeline',
                description:
                  'Track candidates through your pipeline, from initial contact to signed contract.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-gold/20">{item.step}</div>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-y border-border bg-card/50 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-gold text-gold" />
            ))}
          </div>
          <blockquote className="text-2xl font-medium leading-relaxed sm:text-3xl">
            &ldquo;NEWFACE has transformed how we discover talent. The AI scoring
            alone has saved us countless hours and helped us sign three rising
            stars in the past month.&rdquo;
          </blockquote>
          <div className="mt-8">
            <div className="font-semibold">Alexandra Chen</div>
            <div className="text-sm text-muted-foreground">
              Head of Talent, Elite Models NYC
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Analyze hundreds of profiles in minutes',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'SOC 2 compliant with end-to-end encryption',
              },
              {
                icon: Users,
                title: 'Trusted by 500+ Agencies',
                description: 'From boutique firms to global powerhouses',
              },
            ].map((badge) => (
              <div key={badge.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <badge.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{badge.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {badge.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/20 via-gold/10 to-transparent p-12 text-center sm:p-16">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Discover Your Next Star?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Join hundreds of agencies already using NEWFACE to find and sign
                tomorrow&apos;s top talent.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="bg-gold text-background hover:bg-gold-hover px-8">
                    Start Free Trial
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-border px-8">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold">
                <span className="text-lg font-bold text-background">N</span>
              </div>
              <span className="text-xl font-bold tracking-tight">NEWFACE</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} NEWFACE. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
