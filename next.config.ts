import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* otras opciones que ya tenías */
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  experimental: {
    allowedDevOrigins: [
      // reemplaza por el dominio exacto de tu Cloud Workstation
      'https://*.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
