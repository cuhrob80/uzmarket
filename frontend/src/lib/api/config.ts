export function getApiUrl(): string {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    throw new Error('API_URL is not configured');
  }

  return apiUrl.replace(/\/$/, '');
}

export function createApiUrl(path: string): URL {
  return new URL(path, `${getApiUrl()}/`);
}
