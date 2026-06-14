import QRCode from 'qrcode';
import { z } from 'zod';
import { query } from '../config/db.js';
import { redis } from '../config/redis.js';
import { config } from '../config/env.js';
import { randomCode, isValidAlias } from '../utils/base62.js';

const createSchema = z.object({
  destination: z.string().url().max(2048),
  alias: z.string().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

const cacheKey = (code) => `link:${code}`;

function shortUrl(code) {
  return `${config.baseUrl}/${code}`;
}

async function generateUniqueCode() {
  // Try a few times in the unlikely event of a collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode(7);
    const existing = await query('SELECT 1 FROM links WHERE short_code = $1', [
      code,
    ]);
    if (existing.rowCount === 0) return code;
  }
  throw Object.assign(new Error('Could not generate unique code'), {
    status: 500,
  });
}

export async function createLink(req, res, next) {
  try {
    const { destination, alias, expiresAt } = createSchema.parse(req.body);

    let shortCode;
    let isCustom = false;

    if (alias) {
      if (!isValidAlias(alias)) {
        return res.status(400).json({
          error: 'Alias must be 3-32 alphanumeric characters',
        });
      }
      const taken = await query('SELECT 1 FROM links WHERE short_code = $1', [
        alias,
      ]);
      if (taken.rowCount > 0) {
        return res.status(409).json({ error: 'Alias already in use' });
      }
      shortCode = alias;
      isCustom = true;
    } else {
      shortCode = await generateUniqueCode();
    }

    const result = await query(
      `INSERT INTO links (user_id, short_code, destination, is_custom, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, short_code, destination, is_custom, expires_at, created_at`,
      [req.user.id, shortCode, destination, isCustom, expiresAt || null]
    );
    const link = result.rows[0];

    res.status(201).json(serializeLink(link, 0));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: 'A valid destination URL is required' });
    }
    next(err);
  }
}

export async function listLinks(req, res, next) {
  try {
    const result = await query(
      `SELECT l.id, l.short_code, l.destination, l.is_custom, l.expires_at,
              l.created_at, COUNT(c.id)::int AS click_count
       FROM links l
       LEFT JOIN clicks c ON c.link_id = l.id
       WHERE l.user_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows.map((r) => serializeLink(r, r.click_count)));
  } catch (err) {
    next(err);
  }
}

export async function getQrCode(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT short_code FROM links WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    const dataUrl = await QRCode.toDataURL(shortUrl(result.rows[0].short_code), {
      width: 320,
      margin: 1,
    });
    res.json({ dataUrl });
  } catch (err) {
    next(err);
  }
}

export async function deleteLink(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING short_code',
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    await redis.del(cacheKey(result.rows[0].short_code));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

function serializeLink(link, clickCount) {
  return {
    id: link.id,
    shortCode: link.short_code,
    shortUrl: shortUrl(link.short_code),
    destination: link.destination,
    isCustom: link.is_custom,
    expiresAt: link.expires_at,
    createdAt: link.created_at,
    clickCount: clickCount ?? 0,
  };
}
