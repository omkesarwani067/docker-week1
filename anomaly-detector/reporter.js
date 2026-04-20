const { Pool } = require('pg');

const db = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: 5432,
  database: process.env.POSTGRES_DB || 'observability',
  user: process.env.POSTGRES_USER || 'platform',
  password: process.env.POSTGRES_PASSWORD || 'platform_secret',
});

async function initIncidentsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS incidents (
      id                SERIAL PRIMARY KEY,
      severity          VARCHAR(20)  NOT NULL,
      affected_services TEXT[]       NOT NULL,
      summary           TEXT         NOT NULL,
      recommendation    TEXT         NOT NULL,
      patterns          TEXT[]       DEFAULT '{}',
      resolved          BOOLEAN      DEFAULT false,
      created_at        TIMESTAMPTZ  DEFAULT NOW()
    )
  `);
  console.log('[anomaly-detector] incidents table ready');
}

async function saveIncident(analysis) {
  const { severity, affected_services, summary, recommendation, patterns } = analysis;
  const result = await db.query(
    `INSERT INTO incidents (severity, affected_services, summary, recommendation, patterns)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [severity, affected_services, summary, recommendation, patterns || []]
  );
  return result.rows[0].id;
}

async function getRecentIncidents(limit = 20) {
  const result = await db.query(
    `SELECT * FROM incidents ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = { initIncidentsTable, saveIncident, getRecentIncidents };
