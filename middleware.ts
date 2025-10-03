export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/new',
    '/links/:path*/edit',
    '/api/links/:path*'
  ]
};
