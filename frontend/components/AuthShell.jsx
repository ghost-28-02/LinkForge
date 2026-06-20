import Link from 'next/link';
import Logo from '@/components/Logo';

const highlights = [
  'Branded short links with custom aliases',
  'Real-time click analytics & QR codes',
  'Secure, email-verified accounts',
];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />
        </div>
        <Logo href="/" className="relative text-white [&_span]:text-white" />
        <div className="relative">
          <h2 className="max-w-sm text-3xl font-bold leading-snug">
            Smarter links, measurable results.
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-brand-50">
                <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-white/20">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-brand-100">
          © {new Date().getFullYear()} LinkForge
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 lg:hidden">
            <Logo href="/" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthFooterLink({ children }) {
  return (
    <p className="mt-6 text-center text-sm text-slate-600">{children}</p>
  );
}

export { Link };
