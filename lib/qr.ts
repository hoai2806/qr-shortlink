import QRCode from 'qrcode';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export interface GenerateQrOptions {
  text: string; // content encoded into QR
  size: number; // width/height in px
  foregroundColor: string;
  backgroundColor: string;
  logoPath?: string | null; // relative path inside public/logos
}

const colorToRgba = (hex: string) => {
  const h = hex.replace('#','');
  const bigint = parseInt(h,16);
  if (h.length === 3) {
    const r = parseInt(h[0]+h[0],16);
    const g = parseInt(h[1]+h[1],16);
    const b = parseInt(h[2]+h[2],16);
    return {r,g,b};
  }
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r,g,b };
};

export async function generateQrPngBuffer(opts: GenerateQrOptions): Promise<Buffer> {
  const { text, size, foregroundColor, backgroundColor, logoPath } = opts;
  const qrRaw = await QRCode.toBuffer(text, {
    errorCorrectionLevel: 'H',
    color: {
      dark: foregroundColor,
      light: backgroundColor
    },
    margin: 1,
    width: size
  });

  if (!logoPath) return qrRaw;

  try {
    const absoluteLogo = path.join(process.cwd(), 'public', logoPath);
    const logo = await fs.readFile(absoluteLogo);
    const logoSize = Math.round(size * 0.2); // 20% of QR size
    const logoSharp = await sharp(logo).resize(logoSize, logoSize, { fit: 'contain' }).png().toBuffer();

    // Composite logo onto center
    return await sharp(qrRaw)
      .composite([{ input: logoSharp, gravity: 'center' }])
      .png()
      .toBuffer();
  } catch (e) {
    console.error('Logo composite failed', e);
    return qrRaw;
  }
}
