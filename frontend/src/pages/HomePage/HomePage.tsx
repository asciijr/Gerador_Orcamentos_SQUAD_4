import { useEffect, useState } from 'react';
import { getHealth } from '../../services/api';

type ApiState = 'carregando' | 'online' | 'offline';

export function HomePage() {
  const [apiState, setApiState] = useState<ApiState>('carregando');

  useEffect(() => {
    const controller = new AbortController();
    getHealth(controller.signal)
      .then(() => setApiState('online'))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error(error);
          setApiState('offline');
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="page">
      <h1>Gerador de Orçamentos</h1>
      <p>ASCII · Squad 4</p>
      <p data-testid="api-status">API: {apiState}</p>
    </main>
  );
}
