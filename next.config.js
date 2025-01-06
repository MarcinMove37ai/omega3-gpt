/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tymczasowo zostawiamy wyłączone sprawdzanie błędów
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },

  // Dodajemy uproszczoną konfigurację eksperymentalną
  experimental: {
    optimizeCss: true,
    workerThreads: true
  },

  // Optymalizacja obrazów
  images: {
    domains: ['localhost'],
    minimumCacheTTL: 60
  },

  // Konfiguracja środowiska
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  },

  // Dodajemy cache poprzez output
  output: 'standalone',

  // Konfiguracja nagłówków cache
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