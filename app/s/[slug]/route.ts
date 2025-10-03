import { prisma } from '../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface Params { params: { slug: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = params;
  const link = await prisma.link.findUnique({ where: { slug } });
  if (!link) {
    return new NextResponse('Not found', { status: 404 });
  }
  // Increment counters & store scan event (fire and forget)
  prisma.link.update({ where: { id: link.id }, data: { viewsCount: { increment: 1 } } }).catch(()=>{});
  prisma.scanEvent.create({ data: { linkId: link.id, ip: _req.headers.get('x-forwarded-for')?.split(',')[0] || undefined, userAgent: _req.headers.get('user-agent') || undefined } }).catch(()=>{});
  return NextResponse.redirect(link.targetUrl, 302);
}
