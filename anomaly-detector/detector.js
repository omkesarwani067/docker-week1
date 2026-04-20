const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function analyzeLogsWithAI(logs) {
  const logSummary = logs
    .map(l => `[${l.level}] ${l.service} — ${l.message} (at ${l.timestamp})`)
    .join('\n');

  const prompt = `
You are a DevOps anomaly detection system. Analyze these service logs and detect anomalies.

LOGS:
${logSummary}

Respond ONLY with a valid JSON object in this exact format, no extra text:
{
  "anomaly_detected": true or false,
  "severity": "none" | "warning" | "critical",
  "affected_services": ["service-name"],
  "summary": "One sentence summary of what is happening",
  "recommendation": "One sentence on what to do",
  "patterns": ["pattern1", "pattern2"]
}

Rules:
- "critical" if there are ERROR logs, repeated failures, or crash patterns
- "warning" if there are WARN logs or unusual activity
- "none" if everything looks normal
- Be specific about which services are affected
`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    
    const raw = response.data.choices[0].message.content.trim();
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleaned);

  } catch (err) {
    if (err.response) {
      console.error('[detector] Groq API error status:', err.response.status);
      console.error('[detector] Groq API error body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('[detector] Request error:', err.message);
    }
    throw err;
  }
}

module.exports = { analyzeLogsWithAI };