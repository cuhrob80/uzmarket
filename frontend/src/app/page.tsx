import { getApiHealth } from '@/lib/api-health';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const connected = await getApiHealth();
  return (
    <main><section aria-labelledby="title"><h1 id="title">UzMarket</h1><p>API:{' '}
      <strong className={connected ? 'connected' : 'unavailable'}>{connected ? 'connected' : 'unavailable'}</strong>
    </p></section></main>
  );
}
