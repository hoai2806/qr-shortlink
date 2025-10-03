'use client';
import { signOut } from 'next-auth/react';
export default function SignOutButton() { return <button style={{ background:'#374151', padding:'4px 8px' }} onClick={() => signOut({ callbackUrl: '/' })}>Thoát</button>; }
