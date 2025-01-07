/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  output: 'standalone',
  experimental: {
    optimizeCss: true,
    workerThreads: true,
  },
  // Wyłączamy optymalizacje, które mogą powodować problemy
  swcMinify: false,
  // Ustawiamy wszystko jako dynamiczne
  compiler: {
    removeConsole: false,
  },
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

module.exports = nextConfig