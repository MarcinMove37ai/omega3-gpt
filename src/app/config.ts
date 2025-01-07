export const dynamic = 'force-dynamic'
export const runtime = 'edge' // 'nodejs' jest też opcją
export const preferredRegion = 'auto'

// Wyłączamy statyczne generowanie
export const generateStaticParams = () => {
  return []
}
