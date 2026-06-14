import { query } from '../config/db.js';

// Detailed analytics for a single link owned by the requesting user.
export async function getLinkAnalytics(req, res, next) {
  try {
    const { id } = req.params;

    const linkResult = await query(
      `SELECT id, short_code, destination, expires_at, created_at
       FROM links WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    if (linkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    const link = linkResult.rows[0];

    const [total, byBrowser, byOs, byDevice, timeline, recent] =
      await Promise.all([
        query('SELECT COUNT(*)::int AS count FROM clicks WHERE link_id = $1', [
          id,
        ]),
        groupBy(id, 'browser'),
        groupBy(id, 'os'),
        groupBy(id, 'device'),
        query(
          `SELECT to_char(date_trunc('day', clicked_at), 'YYYY-MM-DD') AS day,
                  COUNT(*)::int AS count
           FROM clicks WHERE link_id = $1
           GROUP BY day ORDER BY day`,
          [id]
        ),
        query(
          `SELECT clicked_at, referrer, browser, os, device
           FROM clicks WHERE link_id = $1
           ORDER BY clicked_at DESC LIMIT 25`,
          [id]
        ),
      ]);

    res.json({
      link: {
        id: link.id,
        shortCode: link.short_code,
        destination: link.destination,
        expiresAt: link.expires_at,
        createdAt: link.created_at,
      },
      totalClicks: total.rows[0].count,
      byBrowser: byBrowser.rows,
      byOs: byOs.rows,
      byDevice: byDevice.rows,
      timeline: timeline.rows,
      recentClicks: recent.rows,
    });
  } catch (err) {
    next(err);
  }
}

function groupBy(linkId, column) {
  // column is from a fixed allowlist below, never user input.
  return query(
    `SELECT ${column} AS label, COUNT(*)::int AS count
     FROM clicks WHERE link_id = $1
     GROUP BY ${column} ORDER BY count DESC`,
    [linkId]
  );
}
