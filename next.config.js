/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];

module.exports = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/projects/pool-03', destination: '/projects', permanent: true },
      { source: '/projects/pool-04', destination: '/projects', permanent: true }
    ];
  },
  // Ադմին վահանակը (Sveltia CMS) ստատիկ ֆայլ է՝ public/admin/index.html. /admin հասցեն տանում ենք դրան
  async rewrites() {
    return [{ source: '/admin', destination: '/admin/index.html' }];
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-cache' }] },
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-cache' }] },
      // Նկարներ/տեսանյութ՝ 1 օր քեշ (ֆայլը փոխելիս հին տարբերակը մեկ շաբաթվա ընթացքում աստիճանաբար թարմանում է)
      { source: '/:path*/:file(.+\\.(?:webp|jpg|jpeg|png|mp4))', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] }
    ];
  }
};