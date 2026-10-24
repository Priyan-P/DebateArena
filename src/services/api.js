/**
 * API Service for DebateArena AI Frontend
 */

const API_BASE_URL = '/api';

/**
 * Parses JSON response safely
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage = (data && data.error) || data || `HTTP Error ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Fetch Backend Health Status
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await handleResponse(res);
  } catch (err) {
    console.warn('[API Service] Health check failed:', err.message);
    return { status: 'error', apiKeyConfigured: false, model: 'unknown' };
  }
}

/**
 * Start a new debate session
 */
export async function startDebateApi({ topic, userPosition, difficulty, roundLimit, style }) {
  const res = await fetch(`${API_BASE_URL}/debate/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, userPosition, difficulty, roundLimit, style }),
  });
  return await handleResponse(res);
}

/**
 * Submit user argument and receive AI counterargument
 */
export async function submitArgumentApi({ topic, userPosition, aiPosition, difficulty, style, history, userArgument }) {
  const res = await fetch(`${API_BASE_URL}/debate/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, userPosition, aiPosition, difficulty, style, history, userArgument }),
  });
  return await handleResponse(res);
}

/**
 * Request AI Adjudication & Scoring Report
 */
export async function judgeDebateApi({ topic, userPosition, history }) {
  const res = await fetch(`${API_BASE_URL}/debate/judge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, userPosition, history }),
  });
  return await handleResponse(res);
}
