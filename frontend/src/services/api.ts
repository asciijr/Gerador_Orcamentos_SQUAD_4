// Chamadas à API ficam somente em services/ (Guia de Engenharia, seção 8.2).
export type HealthResponse = { status: 'ok'; timestamp: string };

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch('/api/health', { signal });
  if (!response.ok) {
    throw new Error(`API respondeu ${response.status}`);
  }
  return (await response.json()) as HealthResponse;
}
