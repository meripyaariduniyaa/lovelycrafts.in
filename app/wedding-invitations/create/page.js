import { Suspense } from 'react';
import WeddingCreateClient from '@/components/weddings/WeddingCreateClient';

export const metadata = { title: 'Create Your Wedding Invitation | LovelyCrafts Shaadi' };
export default function WeddingCreatePage() { return <Suspense fallback={<main className="shaadi-shell">Loading the invitation builder…</main>}><WeddingCreateClient /></Suspense>; }
