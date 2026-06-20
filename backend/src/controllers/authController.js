import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/db.js';
import { config } from '../config/env.js';
import { sendOtpEmail, sendResetEmail } from '../utils/email.js';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const emailSchema = z.object({ email: z.string().email() });

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function generateOtp() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

// Create (or refresh) the verification code for a user and email it.
async function issueOtp(user) {
  const code = generateOtp();
  await query('DELETE FROM email_verifications WHERE user_id = $1', [user.id]);
  await query(
    'INSERT INTO email_verifications (user_id, code_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, sha256(code), minutesFromNow(config.otpTtlMinutes)]
  );
  await sendOtpEmail(user.email, code);
}

export async function register(req, res, next) {
  try {
    const { email, password } = credentialsSchema.parse(req.body);

    const existing = await query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (existing.rowCount > 0) {
      const user = existing.rows[0];
      if (user.email_verified) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      // Account exists but was never verified — refresh password + resend code.
      const hash = await bcrypt.hash(password, 12);
      await query('UPDATE users SET password = $1 WHERE id = $2', [
        hash,
        user.id,
      ]);
      await issueOtp(user);
      return res.status(200).json({
        message: 'Verification code sent',
        email: user.email,
        requiresVerification: true,
      });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hash]
    );
    await issueOtp(result.rows[0]);

    res.status(201).json({
      message: 'Verification code sent',
      email,
      requiresVerification: true,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid email or password format' });
    }
    next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { email, code } = verifySchema.parse(req.body);

    const userResult = await query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    if (user.email_verified) {
      const token = signToken(user);
      return res.json({ token, user: { id: user.id, email: user.email } });
    }

    const record = await query(
      `SELECT id, expires_at FROM email_verifications
       WHERE user_id = $1 AND code_hash = $2`,
      [user.id, sha256(code)]
    );
    const row = record.rows[0];
    if (!row || new Date(row.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    await query('UPDATE users SET email_verified = true WHERE id = $1', [
      user.id,
    ]);
    await query('DELETE FROM email_verifications WHERE user_id = $1', [user.id]);

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'A valid 6-digit code is required' });
    }
    next(err);
  }
}

export async function resendOtp(req, res, next) {
  try {
    const { email } = emailSchema.parse(req.body);
    const userResult = await query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user = userResult.rows[0];
    // Always respond success to avoid leaking which emails are registered.
    if (user && !user.email_verified) {
      await issueOtp(user);
    }
    res.json({ message: 'If that account needs verification, a code was sent' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = credentialsSchema.parse(req.body);

    const result = await query(
      'SELECT id, email, password, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.email_verified) {
      await issueOtp(user);
      return res.status(403).json({
        error: 'Please verify your email first. We sent you a new code.',
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid email or password format' });
    }
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = emailSchema.parse(req.body);

    const result = await query(
      'SELECT id, email, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    // Only send to verified accounts, but respond identically either way.
    if (user && user.email_verified) {
      const token = crypto.randomBytes(32).toString('hex');
      await query('DELETE FROM password_resets WHERE user_id = $1', [user.id]);
      await query(
        'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, sha256(token), minutesFromNow(config.resetTtlMinutes)]
      );
      await sendResetEmail(user.email, token);
    }

    res.json({
      message: 'If an account exists for that email, a reset link was sent',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = resetSchema.parse(req.body);

    const record = await query(
      `SELECT id, user_id, expires_at, used_at
       FROM password_resets WHERE token_hash = $1`,
      [sha256(token)]
    );
    const row = record.rows[0];
    if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const hash = await bcrypt.hash(password, 12);
    await query('UPDATE users SET password = $1 WHERE id = $2', [
      hash,
      row.user_id,
    ]);
    await query('UPDATE password_resets SET used_at = now() WHERE id = $1', [
      row.id,
    ]);

    res.json({ message: 'Password updated. You can now sign in.' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'A valid token and password are required' });
    }
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const result = await query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, createdAt: user.created_at });
  } catch (err) {
    next(err);
  }
}
