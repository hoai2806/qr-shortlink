import { prisma } from '../../../../lib/prisma';
import Link from 'next/link';
import UpdateForm from './update-form';

interface Props { params: { id: string } }

export default async function EditPage({ params }: Props) {
  const link = await prisma.link.findUnique({ where: { id: params.id }, include: { qrCode: true } });
  if (!link) return <p>Không tìm thấy</p>;
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Sửa shortlink / QR</h2>
      <p><Link href="/">← Quay lại</Link></p>
      <UpdateForm link={link} />
    </div>
  );
}

export const dynamic = 'force-dynamic';
