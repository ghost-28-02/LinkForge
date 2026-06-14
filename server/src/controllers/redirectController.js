import { query } from '../config/db.js';
import { redis } from '../config/redis.js';
import { config } from '../config/env.js';
import { parseUserAgent } from '../utils/userAgent.js';

const cacheKey = (code) => `link:${code}`;

// Resolve a short code to its destination, using Redis as a read-through cache.
export async function redirect(req, res, next) {
  try {
    const { code } = req.params;

    let destination = null;
    let linkId = null;

    // 1. Try the cache first.
    const cached = await redis.get(cacheKey(code));
    if (cached) {
      const parsed = JSON.parse(cached);
      destination = parsed.destination;
      linkId = parsed.id;
    } else {
      // 2. Cache miss -> fall back to Postgres.
      const result = await query(
        'SELECT id, destination, expires_at FROM links WHERE short_code = $1',
        [code]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Short link not found' });
      }
      const link = result.rows[0];

      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return res.status(410).json({ error: 'This link has expired' });
      }

      destination = link.destination;
      linkId = link.id;

      // Populate the cache for subsequent hits.
      await redis.set(
        cacheKey(code),
        JSON.stringify({ id: link.id, destination: link.destination }),
        { EX: config.cacheTtlSeconds }
      );
    }

    // 3. Log the click asynchronously; never block the redirect on it.
    logClick(linkId, req).catch((err) =>
      console.error('[click] log failed:', err.message)
    );

    res.redirect(302, destination);
  } catch (err) {
    next(err);
  }
}

async function logClick(linkId, req) {
  const { browser, os, device } = parseUserAgent(req.headers['user-agent']);
  const referrer = req.headers.referer || req.headers.referrer || null;
  await query(
    `INSERT INTO clicks (link_id, referrer, browser, os, device)
     VALUES ($1, $2, $3, $4, $5)`,
    [linkId, referrer, browser, os, device]
  );
}
