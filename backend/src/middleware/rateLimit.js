import rateLimit from 'express-rate-limit';

// Strict limiter for auth endpoints (login/register) to deter brute force.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later' },
});

// Limiter for the shorten endpoint to prevent abuse.
export const shortenLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many links created, please slow down' },
});
