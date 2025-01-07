/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  output: 'export',
  distDir: '.next',
  images: {
    unoptimized: true
  },
  experimental: {
    optimizeCss: true,
    workerThreads: true
  }
}

module.exports = nextConfig
