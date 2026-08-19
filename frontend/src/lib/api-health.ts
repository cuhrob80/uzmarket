const HEALTH_PATH = '/api/v1/health';
const TIMEOUT_MS = 3_000;

function isHealthy(value: unknown): boolean {
  return typeof value === 'object' && value !== null && 'status' in value && value.status === 'ok';
}

export async function getApiHealth(): Promise<boolean> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) return false;
  try {
    const response = await fetch(new URL(HEALTH_PATH, apiUrl), {
      cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return false;
    const body: unknown = await response.json();
    return isHealthy(body);
  } catch { return false; }
}
