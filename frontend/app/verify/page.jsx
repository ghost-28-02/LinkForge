'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/AuthShell';
import Alert from '@/components/Alert';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const LENGTH = 6;

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { completeAuth } = useAuth();
  const email = params.get('email') || '';

  const [digits, setDigits] = useState(Array(LENGTH).fill(''));
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function setDigit(i, value) {
    const v = value.replace(/\D/g, '');
    const next = [...digits];
    if (v.length > 1) {
      // Handle paste of full code.
      const chars = v.slice(0, LENGTH).split('');
      for (let j = 0; j < LENGTH; j++) next[j] = chars[j] || '';
      setDigits(next);
      inputs.current[Math.min(chars.length, LENGTH - 1)]?.focus();
      return;
    }
    next[i] = v;
    setDigits(next);
    if (v && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  async function submit(e) {
    e?.preventDefault();
    const code = digits.join('');
    if (code.length !== LENGTH) {
      setError('Enter the full 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.verifyOtp(email, code);
      completeAuth(token, user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function resend() {
    setError('');
    setInfo('');
    try {
      await api.resendOtp(email);
      setInfo('A new code is on its way.');
      setCooldown(30);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!email) {
    return (
      <AuthShell title="Verify your email">
        <Alert>We couldn&apos;t find which email to verify.</Alert>
        <Link href="/signup" className="btn-primary mt-6 w-full">
          Back to sign up
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email}. Enter it below to continue.`}
    >
      <form onSubmit={submit} className="space-y-5">
        <Alert>{error}</Alert>
        <Alert type="success">{info}</Alert>
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              inputMode="numeric"
              maxLength={LENGTH}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className="h-14 w-full rounded-xl border border-slate-200 bg-white text-center text-2xl font-bold text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          ))}
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify & continue'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Didn&apos;t get it?{' '}
        <button
          onClick={resend}
          disabled={cooldown > 0}
          className="font-semibold text-brand-600 hover:text-brand-700 disabled:text-slate-400"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </p>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
