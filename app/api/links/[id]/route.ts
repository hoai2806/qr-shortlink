import { prisma } from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import fs from 'fs/promises';
import path from 'path';

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
    const { targetUrl, size, foregroundColor, backgroundColor, logoBase64 } = data;
    const link = await prisma.link.findUnique({ where: { id: params.id }, include: { qrCode: true } });
    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (link.ownerId && link.ownerId !== (session.user as any).id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (targetUrl) {
      await prisma.link.update({ where: { id: link.id }, data: { targetUrl } });
    }
    if (link.qrCode) {
      let logoPath = link.qrCode.logoPath;
      if (logoBase64) {
        const match = /^data:(image\/(png|jpeg|jpg));base64,(.+)$/.exec(logoBase64);
        if (match) {
          const ext = match[2] === 'jpeg' ? 'jpg' : match[2];
          const buf = Buffer.from(match[3], 'base64');
            const logosDir = path.join(process.cwd(), 'public', 'logos');
            await fs.mkdir(logosDir, { recursive: true });
            logoPath = `logos/${link.slug}.${ext}`;
            await fs.writeFile(path.join(process.cwd(), 'public', logoPath), buf);
        }
      }
      await prisma.qrCode.update({ where: { linkId: link.id }, data: { size: size ? Number(size) : link.qrCode.size, foregroundColor: foregroundColor || link.qrCode.foregroundColor, backgroundColor: backgroundColor || link.qrCode.backgroundColor, logoPath } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const link = await prisma.link.findUnique({ where: { id: params.id }, include: { qrCode: true } });
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(link);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const link = await prisma.link.findUnique({ where: { id: params.id } });
    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (link.ownerId && link.ownerId !== (session.user as any).id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await prisma.qrCode.deleteMany({ where: { linkId: params.id } });
    await prisma.link.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
