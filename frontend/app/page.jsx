import Link from 'next/link';
import Logo from '@/components/Logo';

const features = [
  {
    title: 'Short, branded links',
    desc: 'Turn long URLs into clean, memorable short links with custom aliases your audience will trust.',
    icon: (
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    ),
  },
  {
    title: 'Real-time analytics',
    desc: 'See clicks as they happen, broken down by browser, OS, device, and referrer — all in one place.',
    icon: <path d="M3 3v18h18M7 16l4-6 4 3 5-7" />,
  },
  {
    title: 'Instant QR codes',
    desc: 'Every link comes with a downloadable QR code, perfect for print, packaging, and events.',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3M21 21v.01M17 21h.01M21 17h.01" />
      </>
    ),
  },
  {
    title: 'Link expiration',
    desc: 'Set links to expire automatically — great for time-limited campaigns and one-off shares.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  {
    title: 'Secure by default',
    desc: 'Email-verified accounts, hashed passwords, and rate-limited endpoints keep your data safe.',
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    title: 'Built to scale',
    desc: 'Redis-backed redirects keep your links blazing fast, even under heavy traffic.',
    icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  },
];

function Icon({ children }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            Smart links, real-time insights
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl animate-fade-up text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
            Shorten links.{' '}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
              Amplify results.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg text-slate-600">
            LinkForge turns long, ugly URLs into branded short links with QR
            codes and powerful analytics — so you always know what's working.
          </p>
          <div className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary w-full px-7 py-3 text-base sm:w-auto">
              Start for free
            </Link>
            <Link href="/login" className="btn-ghost w-full px-7 py-3 text-base sm:w-auto">
              I have an account
            </Link>
          </div>

          {/* Mock product card */}
          <div className="mx-auto mt-16 max-w-3xl animate-fade-up">
            <div className="card overflow-hidden shadow-glow">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-3">
                {[
                  { label: 'Total clicks', value: '24,815' },
                  { label: 'Active links', value: '132' },
                  { label: 'Top country', value: 'India' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-slate-50 p-4 text-left">
                    <p className="text-sm text-slate-500">{s.label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {s.value}
                    </p>
                  </div>
                ))}
                <div className="sm:col-span-3 rounded-xl border border-slate-100 p-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-brand-600">
                      linkforge.app/launch
                    </span>
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      +18% this week
                    </span>
                  </div>
                  <div className="mt-3 flex h-16 items-end gap-1.5">
                    {[35, 50, 30, 65, 45, 80, 60, 95, 70, 100, 85, 92].map(
                      (h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className="flex-1 rounded-t bg-gradient-to-t from-brand-200 to-brand-500"
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to manage links
          </h2>
          <p className="mt-4 text-slate-600">
            From quick shares to full campaigns — LinkForge gives you the tools
            and the data.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon>{f.icon}</Icon>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Live in three steps
            </h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                n: '1',
                t: 'Create your account',
                d: 'Sign up and confirm your email with a one-time code — takes under a minute.',
              },
              {
                n: '2',
                t: 'Paste a long URL',
                d: 'Drop in any link, add an optional custom alias and expiry, and forge it.',
              },
              {
                n: '3',
                t: 'Share & track',
                d: 'Share your short link or QR code and watch clicks roll in, live.',
              },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-600 px-8 py-16 text-center text-white shadow-glow">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold md:text-4xl">
            Ready to forge smarter links?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Join LinkForge today. No credit card required.
          </p>
          <Link
            href="/signup"
            className="btn mt-8 bg-white px-7 py-3 text-base text-brand-700 hover:bg-brand-50"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} LinkForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
