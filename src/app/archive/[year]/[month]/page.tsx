import Link from 'next/link';
import { getPhotos, Photo } from '../../../../lib/icloud';
import TimelineGallery from '../../../../components/TimelineGallery';

const ICLOUD_ALBUM_ID = process.env.ICLOUD_ALBUM_ID || 'B2BGY8gBYIzSAT';

export default async function ArchivePage({ params }: { params: { year: string, month: string } }) {
    const { year, month } = await params; // Next 15 compatible, awaiting params just in case

    const allPhotos = await getPhotos(ICLOUD_ALBUM_ID);

    const targetYear = parseInt(year, 10);
    const targetMonth = parseInt(month, 10) - 1; // 0-indexed month

    const archivedPhotos = allPhotos.filter((p: Photo) => {
        const d = new Date(p.date);
        return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
    });

    const dateObj = new Date(targetYear, targetMonth);
    const headerTitle = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <main className="container">
            <div style={{ marginBottom: '32px' }}>
                <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1.1rem' }}>
                    &larr; Back to timeline
                </Link>
            </div>

            <header className="site-header" style={{ marginBottom: '48px', animation: 'none', opacity: 1 }}>
                <h1 style={{ fontSize: '2.5rem', WebkitMaskImage: 'none', maskImage: 'none', animation: 'none' }}>
                    {headerTitle}
                </h1>
                <p className="subtitle">archive</p>
            </header>

            {archivedPhotos.length === 0 ? (
                <div className="empty-state">
                    <p>No photos found for this month.</p>
                </div>
            ) : (
                <TimelineGallery photos={archivedPhotos} />
            )}
        </main>
    );
}

export const revalidate = 3600; // fetch at most once per hour
