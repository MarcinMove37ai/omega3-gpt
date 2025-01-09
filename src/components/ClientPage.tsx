'use client';

import dynamic from 'next/dynamic';

// Używamy noSSR zamiast ssr: false
const MedicalChatbot = dynamic(
  () => import('@/components/MedicalChatbot'),
  { loading: () => <div>Loading...</div>, ssr: false }
);

function ClientPage() {
  return (
    <div suppressHydrationWarning>
      <MedicalChatbot />
    </div>
  );
}

// Dodajemy displayName do debugowania
ClientPage.displayName = 'ClientPage';

export default ClientPage;
