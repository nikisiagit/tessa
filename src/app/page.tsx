import Image from 'next/image';
import { getPhotos } from '../lib/icloud';
import TimelineGallery from '../components/TimelineGallery';
import LiveAge from '../components/LiveAge';

const ICLOUD_ALBUM_ID = process.env.ICLOUD_ALBUM_ID || 'B2BGY8gBYIzSAT';

export default async function Home() {
  const groupedPhotos = await getPhotos(ICLOUD_ALBUM_ID);

  // Get years in descending order
  const years = Object.keys(groupedPhotos)
    .map(Number)
    .sort((a, b) => b - a);

  if (years.length === 0) {
    return (
      <main className="container empty-state">
        <p>No photos found in this album.</p>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="site-header">
        <h1>tessagram</h1>
        <p className="subtitle">journey down the memory lane</p>
        <LiveAge />
      </header>

      <TimelineGallery groupedPhotos={groupedPhotos} years={years} />
    </main>
  );
}

export const revalidate = 3600; // fetch at most once per hour
