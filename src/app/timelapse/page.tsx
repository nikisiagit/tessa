import Link from 'next/link';
import { getPhotos } from '../../lib/icloud';
import { selectFrames } from '../../lib/timelapse';
import GrowthTimelapse from '../../components/GrowthTimelapse';

const ICLOUD_ALBUM_ID = process.env.ICLOUD_ALBUM_ID || 'B2BGY8gBYIzSAT';

export default async function TimelapsePage() {
  const photos = await getPhotos(ICLOUD_ALBUM_ID);
  const frames = selectFrames(photos);

  return (
    <main className="container">
      <div style={{ marginBottom: '32px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1.1rem' }}>
          &larr; Back to timeline
        </Link>
      </div>

      <header className="site-header" style={{ marginBottom: '48px', animation: 'none', opacity: 1 }}>
        <h1 style={{ fontSize: '2.5rem', WebkitMaskImage: 'none', maskImage: 'none', animation: 'none' }}>
          Watch her grow
        </h1>
        <p className="subtitle">one photo from each week</p>
      </header>

      <GrowthTimelapse frames={frames} />
    </main>
  );
}

export const revalidate = 3600;
