/** @type {import('next').NextConfig} */
const nextConfig = {
  // Zachowujemy obecne ignorowanie błędów
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },

  // Dodajemy konfigurację dla output
  output: 'standalone',

  // Wymuszamy tryb dynamiczny
  experimental: {
    optimizeCss: true,
    workerThreads: true
  },

  // Konfiguracja cache i headersów
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig