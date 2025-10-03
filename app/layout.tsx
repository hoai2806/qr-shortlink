import React from 'react';
import './globals.css';
import SessionProviderWrapper from '../components/SessionProviderWrapper';
import UserMenu from './user-menu';

export const metadata = {
  title: 'QR Shortlink Manager',
  description: 'Quản lý QR code và shortlink bằng Next.js + PostgreSQL'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#f5f5f5' }}>
        <header style={{ background: '#111827', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>QR Shortlink Manager</h1>
          <nav style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="/" style={{ color: '#93c5fd' }}>Dashboard</a>
            <a href="/new" style={{ color: '#93c5fd' }}>Tạo QR mới</a>
            <UserMenu />
          </nav>
        </header>
        <SessionProviderWrapper>
          <main style={{ maxWidth: 1000, margin: '1.5rem auto', background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
            {children}
          </main>
        </SessionProviderWrapper>
        <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.8rem', color: '#555' }}>© 2025 QR Manager</footer>
      </body>
    </html>
  );
}
