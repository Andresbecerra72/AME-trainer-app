/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    proxyClientMaxBodySize: '50mb',
    serverActions: {
      bodySizeLimit: '50mb', // Increased from 1mb default to support PDF uploads
    },
  },
  // Turbopack config (empty to silence warning)
  turbopack: {},
}

export default nextConfig
