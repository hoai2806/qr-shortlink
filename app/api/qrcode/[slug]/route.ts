import { prisma } from '../../../../lib/prisma';
import { NextRequest } from 'next/server';
import { generateQrPngBuffer } from '../../../../lib/qr';
import { createHash } from 'crypto';

// Simple in-memory LRU-like cache (manual) (max 100 entries)
const globalCache = global as any;
if (!globalCache.__QR_CACHE__) {
  globalCache.__QR_CACHE__ = new Map<string, Buffer>();
}
const CACHE: Map<string, Buffer> = globalCache.__QR_CACHE__;

interface Params { params: { slug: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const slug = params.slug;
  const link = await prisma.link.findUnique({ where: { slug }, include: { qrCode: true } });
  if (!link || !link.qrCode) {
    return new Response('Not found', { status: 404 });
  }
  const base = process.env.BASE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const contentUrl = `${base}/s/${slug}`; // encoded into QR; stable regardless of target changes
  const keySource = `${slug}|${link.qrCode.size}|${link.qrCode.foregroundColor}|${link.qrCode.backgroundColor}|${link.qrCode.logoPath || ''}|${link.qrCode.updatedAt.getTime()}`;
  const etag = 'W/"' + createHash('sha1').update(keySource).digest('hex') + '"';

  if (req.headers.get('if-none-match') === etag && CACHE.has(keySource)) {
    return new Response(null, { status: 304 });
  }

  if (CACHE.has(keySource)) {
    const cached = CACHE.get(keySource)!;
    return new Response(new Uint8Array(cached), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600', ETag: etag } });
  }

  const buf = await generateQrPngBuffer({
    text: contentUrl,
    size: link.qrCode.size,
    foregroundColor: link.qrCode.foregroundColor,
    backgroundColor: link.qrCode.backgroundColor,
    logoPath: link.qrCode.logoPath || undefined
  });
  // maintain simple size limit
  if (CACHE.size > 100) {
    const iter = CACHE.keys().next();
    if (!iter.done) {
      CACHE.delete(iter.value);
    }
  }
  CACHE.set(keySource, buf);
  return new Response(new Uint8Array(buf), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600', ETag: etag } });
}
