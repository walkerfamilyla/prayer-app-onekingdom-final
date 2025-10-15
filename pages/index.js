// pages/index.js
import dynamic from 'next/dynamic';

// Load the UI **client-side only** to avoid hydration mismatches.
const PrayerApp = dynamic(() => import('../components/PrayerApp'), { ssr: false });

export default function Home() {
  return <PrayerApp />;
}
