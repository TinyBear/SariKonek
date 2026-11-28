import axios from 'axios';

export function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (!e.response) {
      return 'Cannot reach the server. Check your connection and the API URL.';
    }
    const data = e.response.data;
    if (typeof data === 'string' && data) return data;
    if (Array.isArray(data)) return data.join('\n');
    if (data && typeof data === 'object') {
      const d = data as { title?: string; errors?: Record<string, string[]> };
      if (d.errors) return Object.values(d.errors).flat().join('\n');
      if (d.title) return d.title;
    }
    return `Request failed (HTTP ${e.response.status}).`;
  }
  return e instanceof Error ? e.message : 'Something went wrong.';
}