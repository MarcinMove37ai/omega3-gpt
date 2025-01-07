import dynamic from 'next/dynamic'

const MedicalChatbot = dynamic(() => import('@/components/MedicalChatbot'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return (
    <div suppressHydrationWarning>
      <MedicalChatbot />
    </div>
  );
}
