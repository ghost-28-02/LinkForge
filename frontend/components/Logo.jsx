import Link from 'next/link';

export default function Logo({ href = '/', className = '' }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-xl font-extrabold tracking-tight ${className}`}
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </span>
      <span>
        Link<span className="text-brand-600">Forge</span>
      </span>
    </Link>
  );
}
