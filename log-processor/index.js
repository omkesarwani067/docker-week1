const { createClient } = require('redis');
const { Pool } = require('pg');

const SERVICE = 'log-processor';

// PostgreSQL connection
const db = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: 5432,
  database: process.env.POSTGRES_DB || 'observability',
  user: process.env.POSTGRES_USER || 'platform',
  password: process.env.POSTGRES_PASSWORD || 'platform_secret',
});

// Redis connection
const redis = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
redis.on('error', (err) => console.error('[redis] error:', err));

// Create logs table if it doesn't exist
async function initDB() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id        SERIAL PRIMARY KEY,
      service   VARCHAR(100) NOT NULL,
      level     VARCHAR(10)  NOT NULL,
      message   TEXT         NOT NULL,
      metadata  JSONB        DEFAULT '{}',
      timestamp TIMESTAMPTZ  NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log(`[${SERVICE}] Database table ready`);
}

// Process logs from Redis Stream
async function processLogs() {
  let lastId = '0'; // start from beginning on boot

  console.log(`[${SERVICE}] Listening on Redis Stream logs:stream...`);

  while (true) {
    try {
      // Read up to 10 new messages, block for 2s if stream is empty
      const results = await redis.xRead(
        [{ key: 'logs:stream', id: lastId }],
        { COUNT: 10, BLOCK: 2000 }
      );

      if (!results) continue; // no new messages, loop again

      for (const { messages } of results) {
        for (const { id, message } of messages) {
          const { service, level, message: msg, metadata, timestamp } = message;

          // Save to PostgreSQL
          await db.query(
            `INSERT INTO logs (service, level, message, metadata, timestamp)
             VALUES ($1, $2, $3, $4, $5)`,
            [service, level, msg, metadata || '{}', timestamp]
          );

          console.log(`[${SERVICE}] Saved: [${level}] ${service} — ${msg}`);
          lastId = id; // advance stream cursor
        }
      }
    } catch (err) {
      console.error(`[${SERVICE}] Error processing logs:`, err.message);
      await new Promise(r => setTimeout(r, 3000)); // wait before retrying
    }
  }
}

async function main() {
  console.log(`[${SERVICE}] Starting...`);
  await redis.connect();
  console.log(`[${SERVICE}] Connected to Redis`);
  await initDB();
  await processLogs();
}

main().catch(console.error);
