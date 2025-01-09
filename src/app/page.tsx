import ClientPage from '@/components/ClientPage';

// Usuwamy dynamic i revalidate
export default function Home() {
  return (
    <div suppressHydrationWarning>
      <ClientPage />
    </div>
  );
}
