import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/server';
import { ProfileForm } from './profile-form';
import { AccountShell } from '@/components/account-shell';
import { getRequestLocale } from '@/lib/server-locale';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getRequestLocale()]);

  if (!user) {
    redirect(`/${locale}/login?returnTo=/${locale}/profile`);
  }

  return (
    <AccountShell active="profile">
      <main className="profile-page account-content-page">
        <section className="profile-container">
          <h1>{locale === 'uz' ? 'Profil sozlamalari' : 'Настройки профиля'}</h1>
          <ProfileForm user={user} />
        </section>
      </main>
    </AccountShell>
  );
}
