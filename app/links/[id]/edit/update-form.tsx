'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  link: any;
}

export default function UpdateForm({ link }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const body: any = {};
    formData.forEach((v,k) => body[k] = v);
    body.size = parseInt(body.size, 10);
    if (logoBase64) body.logoBase64 = logoBase64;
    try {
      const res = await fetch(`/api/links/${link.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 620 }}>
      {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
      <div>
        <label>Slug (không đổi để QR ổn định)</label>
        <input defaultValue={link.slug} disabled />
      </div>
      <div>
        <label>Target URL</label>
        <input name="targetUrl" type="url" defaultValue={link.targetUrl} required style={{ width: '100%' }} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label>Kích thước</label>
          <input name="size" type="number" defaultValue={link.qrCode?.size || 300} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Foreground</label>
          <input name="foregroundColor" type="color" defaultValue={link.qrCode?.foregroundColor || '#000000'} />
        </div>
        <div style={{ flex: 1 }}>
          <label>Background</label>
          <input name="backgroundColor" type="color" defaultValue={link.qrCode?.backgroundColor || '#FFFFFF'} />
        </div>
      </div>
      <div>
        <label>Logo mới (để trống nếu giữ logo cũ)</label>
        <input type="file" accept="image/*" onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => { setLogoBase64(r.result as string); setPreview(r.result as string); };
          r.readAsDataURL(f);
        }} />
        {preview && <img src={preview} alt="logo" style={{ width: 64, height: 64, objectFit: 'contain', border: '1px solid #ccc', marginTop: 4 }} />}
      </div>
      <button disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: '0.75rem' }}>QR hiển thị: <code>/api/qrcode/{link.slug}</code></p>
        <img src={`/api/qrcode/${link.slug}?_=${Date.now()}`} alt="qr" style={{ width: 180, height: 180 }} />
      </div>
    </form>
  );
}
