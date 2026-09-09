import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api/server';
import { ProfileForm } from './profile-form';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="profile-page">
      <section className="profile-container">
        <h1>Настройки профиля</h1>
        <ProfileForm user={user} />
      </section>
    </main>
  );
}
