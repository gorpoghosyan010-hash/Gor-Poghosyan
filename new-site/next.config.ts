import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname) },
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560]
  }
};

export default nextConfig;
