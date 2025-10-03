import { prisma } from '../lib/prisma';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const where = session ? { ownerId: (session.user as any).id } : {};
  const links = await prisma.link.findMany({
    include: { qrCode: true },
    orderBy: { createdAt: 'desc' },
    where
  });
  const base = process.env.BASE_URL || 'http://localhost:3000';
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Danh sách QR / Shortlinks</h2>
      {!session && <p style={{ fontSize: '.75rem', color: '#b91c1c' }}>Bạn chưa đăng nhập - hiển thị tất cả public links (nếu ownerId rỗng).</p>}
      <p style={{ fontSize: '0.85rem' }}>Tổng cộng: {links.length}</p>
      <table>
        <thead>
          <tr>
            <th>Slug</th>
            <th>Target URL</th>
            <th>QR Preview</th>
            <th>Cập nhật</th>
            <th>Lượt quét</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {links.map(l => (
            <tr key={l.id}>
              <td><code>{l.slug}</code></td>
              <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.targetUrl}</td>
              <td>{l.qrCode && (
                <img src={`/api/qrcode/${l.slug}`} alt={l.slug} style={{ width: 64, height: 64 }} />
              )}</td>
              <td>{new Date(l.updatedAt).toLocaleString('vi-VN')}</td>
              <td>{l.viewsCount}</td>
              <td>
                <Link href={`/links/${l.id}/edit`}>Sửa</Link>{' '}|{' '}
                <a href={`${base}/s/${l.slug}`} target="_blank">Mở</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
