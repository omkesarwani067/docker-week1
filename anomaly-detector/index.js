require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { Pool } = require('pg');
const { analyzeLogsWithAI } = require('./detector');
const { initIncidentsTable, saveIncident, getRecentIncidents } = require('./reporter');

const SERVICE = 'anomaly-detector';
const app = express();
app.use(express.json());

const db = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: 5432,
  database: process.env.POSTGRES_DB || 'observability',
  user: process.env.POSTGRES_USER || 'platform',
  password: process.env.POSTGRES_PASSWORD || 'platform_secret',
});

async function fetchRecentLogs() {
  const result = await db.query(
    `SELECT service, level, message, metadata, timestamp
     FROM logs
     ORDER BY timestamp DESC
     LIMIT 50`
  );
  return result.rows;
}

async function runDetectionCycle() {
  console.log(`[${SERVICE}] Running anomaly detection cycle...`);
  try {
    const logs = await fetchRecentLogs();

    if (logs.length === 0) {
      console.log(`[${SERVICE}] No logs found yet, skipping.`);
      return;
    }

    const analysis = await analyzeLogsWithAI(logs);
    console.log(`[${SERVICE}] AI verdict: severity=${analysis.severity}, anomaly=${analysis.anomaly_detected}`);

    if (analysis.anomaly_detected && analysis.severity !== 'none') {
      const incidentId = await saveIncident(analysis);
      console.log(`[${SERVICE}] Incident #${incidentId} saved — ${analysis.severity.toUpperCase()}: ${analysis.summary}`);
    } else {
      console.log(`[${SERVICE}] All systems normal`);
    }
  } catch (err) {
    console.error(`[${SERVICE}] Detection cycle error:`, err.message);
  }
}

app.get('/incidents', async (req, res) => {
  try {
    const incidents = await getRecentIncidents();
    res.json({ incidents, total: incidents.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: SERVICE, uptime: process.uptime() });
});

async function main() {
  console.log(`[${SERVICE}] Starting...`);
  await initIncidentsTable();
  await runDetectionCycle();
  cron.schedule('*/30 * * * * *', runDetectionCycle);
  app.listen(3004, () => {
    console.log(`[${SERVICE}] API running on port 3004`);
  });
}

main().catch(console.error);
