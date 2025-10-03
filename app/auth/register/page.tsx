import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/');
  // Simple rule: allow unlimited register (you can later restrict)
  return (
    <div style={{ maxWidth: 380, margin: '0 auto' }}>
      <h2>Đăng ký</h2>
      <form action={register} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ fontSize: '.75rem' }}>Email<input name="email" type="email" required /></label>
        <label style={{ fontSize: '.75rem' }}>Tên (tùy chọn)<input name="name" /></label>
        <label style={{ fontSize: '.75rem' }}>Mật khẩu<input name="password" type="password" required minLength={6} /></label>
        <button>Tạo tài khoản</button>
      </form>
      <p style={{ fontSize: '.8rem', marginTop: 12 }}>Đã có tài khoản? <a href="/auth/signin">Đăng nhập</a></p>
    </div>
  );
}

async function register(formData: FormData) {
  const email = String(formData.get('email'));
  const name = formData.get('name') ? String(formData.get('name')) : undefined;
  const password = String(formData.get('password'));
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return redirect('/auth/signin');
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, name, passwordHash: hash } });
  redirect('/auth/signin');
}
