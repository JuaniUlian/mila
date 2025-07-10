
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
      // Se añade la URL específica del Cloud Workstation para permitir CORS.
      'https://9003-firebase-studio-1747512173228.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
