/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  output: 'standalone',
  distDir: '.next',
  images: {
    unoptimized: true
  },
  experimental: {
    optimizeCss: true,
    workerThreads: true
  },
  // Wyłączamy generowanie statycznych stron
  staticPageGenerationTimeout: 0,
  // Wymuszamy tryb serverowy dla wszystkich stron
  rewrites: async () => {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ]
  }
}

module.exports = nextConfig
