const { createClient } = require('redis');

let client = null;

async function getClient() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
    client.on('error', (err) => console.error('[logger] Redis error:', err));
    await client.connect();
  }
  return client;
}

async function log(service, level, message, metadata = {}) {
  try {
    const redis = await getClient();
    await redis.xAdd('logs:stream', '*', {
      service,
      level,        // INFO | WARN | ERROR
      message,
      metadata: JSON.stringify(metadata),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[logger] Failed to emit log:', err.message);
  }
}

module.exports = { log };
