import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/server';
import { ProfileForm } from './profile-form';
import { AccountShell } from '@/components/account-shell';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <AccountShell active="profile">
      <main className="profile-page account-content-page">
        <section className="profile-container">
          <h1>Настройки профиля</h1>
          <ProfileForm user={user} />
        </section>
      </main>
    </AccountShell>
  );
}
