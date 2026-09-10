import { redirect } from 'next/navigation';
import { AccountShell } from '@/components/account-shell';
import { getCurrentUser } from '@/lib/api/server';
import { getRequestLocale } from '@/lib/server-locale';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getRequestLocale()]);
  const text = locale === 'uz'
    ? {
        title: 'Xabarlar',
        description: 'Bu yerda xaridorlar va sotuvchilar bilan yozishmalar saqlanadi.',
        note: 'Xabarlar bo‘limi keyingi bosqichda ulanadi.',
      }
    : {
        title: 'Сообщения',
        description: 'Здесь будут храниться переписки с покупателями и продавцами.',
        note: 'Раздел сообщений подключим следующим этапом.',
      };

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
