/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tymczasowo zostawiamy wyłączone sprawdzanie błędów
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },

  // Dodajemy konfigurację cache i optymalizacje
  experimental: {
    buildCache: true,
    workerThreads: true,
    optimizeCss: true
  },

  // Określamy jakie foldery powinny być cachowane
  distDir: '.next',

  // Dodajemy optymalizacje produkcyjne
  swcMinify: true,
  compress: true,

  // Optymalizacja obrazów
  images: {
    domains: ['localhost'],
    minimumCacheTTL: 60
  },

  // Konfiguracja środowiska
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  },

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