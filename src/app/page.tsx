import Image from 'next/image';
import { getPhotos } from '@/lib/icloud';

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
        <h1>Tessa</h1>
        <p className="subtitle">Memories through the years</p>
      </header>

      <div className="timeline">
        {years.map((year) => (
          <section key={year} className="year-section" id={`year-${year}`}>
            <h2 className="year-title">{year}</h2>
            <div className="photo-grid">
              {groupedPhotos[parseInt(year.toString())].map((photo: any) => (
                <div key={photo.id} className="photo-card">
                  <picture className="photo-container">
                    {/* Fallback to simple img tag for remote iCloud URLs to bypass extra config overhead,
                        or we can just use img directly because it's external and domains are unpredictable */}
                    <img
                      src={photo.url}
                      alt={`Photo taken in ${year}`}
                      loading="lazy"
                      className="photo-img"
                    />
                  </picture>
                  <p className="photo-date">
                    {photo.date.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export const revalidate = 3600; // fetch at most once per hour
