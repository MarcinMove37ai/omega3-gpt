'use client';

import dynamic from 'next/dynamic';

const MedicalChatbot = dynamic(() => import('@/components/MedicalChatbot'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function ClientPage() {
  return (
    <div suppressHydrationWarning>
      <MedicalChatbot />
    </div>
  );
}
