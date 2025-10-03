import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/');
  return (
    <div style={{ maxWidth: 380, margin: '0 auto' }}>
      <h2>Đăng nhập</h2>
      <form method="post" action="/api/auth/callback/credentials" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ fontSize: '.75rem' }}>Email<input name="email" type="email" required style={{ width: '100%' }} /></label>
        <label style={{ fontSize: '.75rem' }}>Mật khẩu<input name="password" type="password" required style={{ width: '100%' }} /></label>
        <button>Đăng nhập</button>
      </form>
      <p style={{ fontSize: '.8rem', marginTop: 12 }}>Chưa có tài khoản? <a href="/auth/register">Đăng ký</a></p>
    </div>
  );
}
