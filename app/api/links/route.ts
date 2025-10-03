import { prisma } from '../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
    const { targetUrl, slug, size = 300, foregroundColor = '#000000', backgroundColor = '#FFFFFF', logoBase64 } = data;
    if (!targetUrl) return NextResponse.json({ error: 'targetUrl required' }, { status: 400 });
    let finalSlug = (slug || '').trim().toLowerCase();
    if (!finalSlug) {
      finalSlug = randomUUID().slice(0, 8);
    } else if (!/^[a-z0-9_-]+$/.test(finalSlug)) {
      return NextResponse.json({ error: 'Slug chỉ gồm a-z 0-9 _ -' }, { status: 400 });
    }
    const exists = await prisma.link.findUnique({ where: { slug: finalSlug } });
    if (exists) return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 400 });

    let logoPath: string | undefined = undefined;
    if (logoBase64) {
      const match = /^data:(image\/(png|jpeg|jpg));base64,(.+)$/.exec(logoBase64);
      if (match) {
        const ext = match[2] === 'jpeg' ? 'jpg' : match[2];
        const buf = Buffer.from(match[3], 'base64');
        const logosDir = path.join(process.cwd(), 'public', 'logos');
        await fs.mkdir(logosDir, { recursive: true });
        logoPath = path.join('logos', `${finalSlug}.${ext}`);
        await fs.writeFile(path.join(process.cwd(), 'public', logoPath), buf);
      }
    }

  const link = await prisma.link.create({ data: { slug: finalSlug, targetUrl, ownerId: (session.user as any).id } });
    await prisma.qrCode.create({ data: { linkId: link.id, size: Number(size), foregroundColor, backgroundColor, logoPath } });
    return NextResponse.json({ ok: true, id: link.id, slug: link.slug });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
