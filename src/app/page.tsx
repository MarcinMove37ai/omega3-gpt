'use client';

import dynamic from 'next/dynamic';

const MedicalChatbot = dynamic(
  () => import('@/components/MedicalChatbot'),
  { ssr: false }
);

export default function Home() {
  return (
    <div suppressHydrationWarning>
      <MedicalChatbot />
    </div>
  );
}
