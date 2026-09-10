import { redirect } from 'next/navigation';
import { AccountShell } from '@/components/account-shell';
import { getCurrentUser } from '@/lib/api/server';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?returnTo=/messages');
  }

  return (
    <AccountShell active="messages">
      <main className="account-content-page messages-page">
        <section className="messages-placeholder">
          <span aria-hidden="true">◯</span>
          <h1>Сообщения</h1>
          <p>
            Здесь будут храниться переписки с покупателями и продавцами.
          </p>
          <small>Раздел сообщений подключим следующим этапом.</small>
        </section>
      </main>
    </AccountShell>
  );
}
