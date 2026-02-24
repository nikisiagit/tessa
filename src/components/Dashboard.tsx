import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Gallery } from './Gallery';
import { Archive } from './Archive';
import { PhotoModal } from './PhotoModal';
import type { PhotoData } from '../data/types';
import { LogOut, Loader2, Image as ImageIcon, Archive as ArchiveIcon, ArrowLeft } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { logout } = useAuth();
    const [photos, setPhotos] = useState<PhotoData[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'this_year' | 'archive'>('this_year');
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);

    useEffect(() => {
        fetch('/data/photos.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch photos');
                return res.json();
            })
            .then((data: PhotoData[]) => setPhotos(data))
            .catch(err => console.warn('Could not load photos, falling back to empty state:', err))
            .finally(() => setLoading(false));
    }, []);

    const currentYear = new Date().getFullYear().toString();

    const photosByYear = useMemo(() => {
        const grouped: Record<string, PhotoData[]> = {};
        photos.forEach(photo => {
            const year = new Date(photo.date).getFullYear().toString();
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(photo);
        });
        return grouped;
    }, [photos]);

    const thisYearPhotos = photosByYear[currentYear] || [];

    // Archive years are all except current year OR just all years if you uncomment, 
    // but logically archive should be past years.
    const archiveYears = Object.keys(photosByYear)
        .filter(year => year !== currentYear)
        .sort((a, b) => Number(b) - Number(a));

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
            </div>
        );
    }

    const isViewingArchiveYear = activeTab === 'archive' && selectedYear !== null;
    const displayPhotos = isViewingArchiveYear
        ? photosByYear[selectedYear] || []
        : thisYearPhotos;

    return (
        <div style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="container">
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--color-text)' }}>Tessa's Memories</h1>
                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)' }}>A beautiful collection of our timeless moments</p>
                    </div>

                    <button onClick={logout} className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LogOut size={18} /> Exit
                    </button>
                </header>

                {/* Navigation Controls */}
                {!isViewingArchiveYear ? (
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                        <button
                            onClick={() => setActiveTab('this_year')}
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                fontFamily: 'var(--font-serif)',
                                borderBottom: activeTab === 'this_year' ? '3px solid var(--color-primary)' : '3px solid transparent',
                                color: activeTab === 'this_year' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                fontWeight: activeTab === 'this_year' ? 600 : 400,
                                transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                opacity: activeTab === 'this_year' ? 1 : 0.6
                            }}
                        >
                            <ImageIcon size={20} /> This Year
                        </button>
                        <button
                            onClick={() => setActiveTab('archive')}
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                fontFamily: 'var(--font-serif)',
                                borderBottom: activeTab === 'archive' ? '3px solid var(--color-primary)' : '3px solid transparent',
                                color: activeTab === 'archive' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                fontWeight: activeTab === 'archive' ? 600 : 400,
                                transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                opacity: activeTab === 'archive' ? 1 : 0.6
                            }}
                        >
                            <ArchiveIcon size={20} /> Archive
                        </button>
                    </div>
                ) : (
                    <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <button
                            onClick={() => setSelectedYear(null)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                color: 'var(--color-primary)', fontWeight: 500, fontSize: '1.1rem',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateX(-5px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                            <ArrowLeft size={20} /> Back to Archives
                        </button>
                        <h2 style={{ marginTop: '1.5rem', fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>
                            Tessa's memory box from {selectedYear}
                        </h2>
                    </div>
                )}

                {/* Galleries & Content */}
                <div className="animate-fade-in">
                    {activeTab === 'this_year' && (
                        <Gallery photos={thisYearPhotos} onPhotoClick={setSelectedPhoto} />
                    )}

                    {activeTab === 'archive' && !isViewingArchiveYear && (
                        <Archive years={archiveYears} onSelectYear={setSelectedYear} />
                    )}

                    {isViewingArchiveYear && (
                        <Gallery photos={displayPhotos} onPhotoClick={setSelectedPhoto} />
                    )}
                </div>
            </div>

            <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        </div>
    );
};
