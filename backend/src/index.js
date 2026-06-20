import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectRedis } from './config/redis.js';
import { pool } from './config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Apply the schema on boot. Statements use IF NOT EXISTS, so this is idempotent.
async function ensureSchema() {
  const sql = readFileSync(join(__dirname, 'db', 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('[db] schema ensured');
}

async function start() {
  try {
    await connectRedis();
    await pool.query('SELECT 1'); // verify DB connectivity
    console.log('[db] connected');
    await ensureSchema();

    const app = createApp();
    app.listen(config.port, () => {
      console.log(`[server] LinkForge API listening on port ${config.port}`);
    });
  } catch (err) {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  }
}

start();
