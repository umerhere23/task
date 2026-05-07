import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-4">Frontend dashboard entrypoint.</p>
      <Link href="/" className="text-blue-600 hover:text-blue-800">
        Back to home
      </Link>
    </main>
  );
}
