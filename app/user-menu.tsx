import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import SignOutButton from './user-signout-btn';
import Link from 'next/link';

export default async function UserMenu() {
  const session = await getServerSession(authOptions);
  if (!session) return <Link href="/auth/signin" style={{ color: '#93c5fd' }}>Đăng nhập</Link>;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.75rem' }}>
      <span style={{ color: '#9ca3af' }}>{session.user?.email}</span>
      <SignOutButton />
    </span>
  );
}
