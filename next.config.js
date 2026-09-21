/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];

module.exports = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Նկարներ/տեսանյութ՝ 1 օր քեշ (ֆայլը փոխելիս հին տարբերակը մեկ շաբաթվա ընթացքում աստիճանաբար թարմանում է)
      { source: '/:path*/:file(.+\\.(?:webp|jpg|jpeg|png|mp4))', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] }
    ];
  }
};