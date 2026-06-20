import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgres://linkforge:linkforge@localhost:5432/linkforge',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  baseUrl: process.env.BASE_URL || 'http://localhost:4000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 3600,

  // Public URL of the Next.js frontend — used to build links in emails.
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  // Brevo (Sendinblue) transactional email.
  brevoApiKey: process.env.BREVO_API_KEY || '',
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'no-reply@linkforge.app',
  brevoSenderName: process.env.BREVO_SENDER_NAME || 'LinkForge',

  // OTP / reset token lifetimes.
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES) || 10,
  resetTtlMinutes: Number(process.env.RESET_TTL_MINUTES) || 30,
};
