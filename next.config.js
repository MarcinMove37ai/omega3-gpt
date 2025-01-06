/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

// Dodajemy konfigurację cache
  experimental: {
    enableBuildCache: true,
    buildCacheDir: '.next/cache'
  },

  // Określamy jakie foldery powinny być cachowane
  cache: {
    directories: [
      '.next/cache',
      'node_modules/.cache'
    ]
  },

  // Dodajemy optymalizacje produkcyjne
  swcMinify: true,
  compress: true,

  // Optymalizacja obrazów
  images: {
    domains: ['localhost'],
    minimumCacheTTL: 60,
  },

  // Optymalizacja komponentów serwerowych
  serverComponents: true,

  // Konfiguracja środowiska
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }
}

module.exports = nextConfig
