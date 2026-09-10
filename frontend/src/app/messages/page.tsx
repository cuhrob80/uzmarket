import { redirect } from 'next/navigation';
import { AccountShell } from '@/components/account-shell';
import { getCurrentUser } from '@/lib/api/server';
import { getRequestLocale } from '@/lib/server-locale';
import { getDictionary } from '@/i18n/dictionaries';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getRequestLocale()]);
  const text = getDictionary(locale).messagesPage;

  if (!user) {
    redirect(`/${locale}/login?returnTo=/${locale}/messages`);
  }

  return (
    <AccountShell active="messages">
      <main className="account-content-page messages-page">
        <section className="messages-placeholder">
          <span aria-hidden="true">◯</span>
          <h1>{text.title}</h1>
          <p>
            {text.description}
          </p>
          <small>{text.note}</small>
        </section>
      </main>
    </AccountShell>
  );
}
