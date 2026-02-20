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
    domains: ['images.financialmodelingprep.com'],
  },
};

export default nextConfig;
