import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  serverExternalPackages: ['pdf-parse', 'puppeteer'],
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: 'images.financialmodelingprep.com' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
