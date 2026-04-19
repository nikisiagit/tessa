import Link from 'next/link';
import { getPhotos, Photo } from '../lib/icloud';
import TimelineGallery from '../components/TimelineGallery';
import LiveAge from '../components/LiveAge';

const ICLOUD_ALBUM_ID = process.env.ICLOUD_ALBUM_ID || 'B2BGY8gBYIzSAT';

export default async function Home() {
  const allPhotos = await getPhotos(ICLOUD_ALBUM_ID);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Filter for ONLY the current month and sort most recent first
  const currentMonthPhotos = allPhotos
    .filter((p: Photo) => {
      const d = new Date(p.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .sort((a: Photo, b: Photo) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate distinct available months for the archive navigation
  const archiveSet = new Set<string>();
  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  allPhotos.forEach(p => {
    const d = new Date(p.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key !== currentMonthKey) {
      archiveSet.add(key);
    }
  });

  // Sort archives newest first (e.g. 2026-02, 2026-01 ...)
  const archives = Array.from(archiveSet).sort((a, b) => b.localeCompare(a));

  return (
    <main className="container">
      <header className="site-header">
        <h1>tessagram</h1>
        <p className="subtitle">journey down the memory lane</p>
        <LiveAge />
      </header>

      {currentMonthPhotos.length === 0 ? (
        <div className="empty-state">
          <p>No new photos yet this month.</p>
        </div>
      ) : (
        <TimelineGallery photos={currentMonthPhotos} />
      )}

      {archives.length > 0 && (
        <div className="archive-navigation" style={{ marginTop: '64px', borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Archives</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {archives.map(archiveKey => {
              const [y, m] = archiveKey.split('-');
              const dateObj = new Date(parseInt(y), parseInt(m) - 1);
              const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              return (
                <Link key={archiveKey} href={`/archive/${y}/${m}`} style={{
                  padding: '8px 16px', borderRadius: '20px', background: 'var(--border-color)', color: 'var(--text-color)', textDecoration: 'none', fontSize: '0.9rem'
                }}>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

export const revalidate = 3600; // fetch at most once per hour
