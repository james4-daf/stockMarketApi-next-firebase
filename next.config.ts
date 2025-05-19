import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  /* config options here */
  images: {
    domains: ['images.financialmodelingprep.com'],
  },
};

export default nextConfig;
