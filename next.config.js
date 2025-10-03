/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/qrcode/:slug',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=300' }
        ]
      }
    ];
  },
  typescript: {
    ignoreBuildErrors: false
  }
};
module.exports = nextConfig;
