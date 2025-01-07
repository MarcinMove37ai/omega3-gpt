/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  trailingSlash: true,
  output: 'export',
  images: {
    unoptimized: true
  },
  experimental: {
    optimizeCss: false, // Wyłączamy eksperymentalną optymalizację CSS
    workerThreads: false // Wyłączamy wątki robocze
  }
}

module.exports = nextConfig