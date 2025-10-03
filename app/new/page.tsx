'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewLinkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

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
      const res = await fetch('/api/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Tạo QR / Shortlink mới</h2>
      {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div>
          <label>Target URL (link gốc)</label>
          <input name="targetUrl" type="url" required placeholder="https://example.com/page" style={{ width: '100%' }} />
        </div>
        <div>
          <label>Tùy chọn slug (để trống nếu random)</label>
          <input name="slug" placeholder="vd: khuyenmai" />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Kích thước (px)</label>
            <input name="size" type="number" defaultValue={300} min={120} max={1024} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Màu QR (foreground)</label>
            <input name="foregroundColor" type="color" defaultValue="#000000" />
          </div>
          <div style={{ flex: 1 }}>
            <label>Màu nền (background)</label>
            <input name="backgroundColor" type="color" defaultValue="#FFFFFF" />
          </div>
        </div>
        <div>
          <label>Logo (PNG/JPG vuông nhỏ)</label>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                setLogoBase64(reader.result as string);
                setPreview(reader.result as string);
              };
              reader.readAsDataURL(file);
            }} />
            {preview && <img src={preview} alt="logo" style={{ width: 64, height: 64, objectFit: 'contain', border: '1px solid #ccc', marginTop: 4 }} />}
        </div>
        <button disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo'}</button>
      </form>
    </div>
  );
}
