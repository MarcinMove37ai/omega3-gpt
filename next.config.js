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
  // Dodajemy konfigurację dla statycznego eksportu
  exportPathMap: async function () {
    return {
      '/': { page: '/' }
    };
  },
  // Wyłączamy wszystkie eksperymentalne funkcje
  experimental: {}
}
