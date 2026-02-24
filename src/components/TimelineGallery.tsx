'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Photo } from '../lib/icloud';
import PhotoComments from './PhotoComments';

interface TimelineGalleryProps {
    groupedPhotos: Record<number, Photo[]>;
    years: number[];
}

function LazyMedia({ photo, year }: { photo: Photo; year: number }) {
    const [loaded, setLoaded] = useState(false);
    const isVideo = photo.thumbnailUrl.includes('.mp4');

    return (
        <picture className="photo-container">
            {isVideo ? (
                <video
                    src={photo.thumbnailUrl}
                    controls
                    muted
                    playsInline
                    className={`photo-img interactive-img ${loaded ? 'loaded' : ''}`}
                    style={{ objectFit: 'cover' }}
                    onLoadedData={() => setLoaded(true)}
                />
            ) : (
                <img
                    src={photo.thumbnailUrl}
                    alt={`Photo taken in ${year}`}
                    loading="lazy"
                    className={`photo-img interactive-img ${loaded ? 'loaded' : ''}`}
                    onLoad={() => setLoaded(true)}
                />
            )}
        </picture>
    );
}

export default function TimelineGallery({ groupedPhotos, years }: TimelineGalleryProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [visibleCount, setVisibleCount] = useState(12);

    const flatPhotos = useMemo(() => {
        const list: { year: number; photo: Photo }[] = [];
        for (const y of years) {
            for (const p of groupedPhotos[y]) {
                list.push({ year: y, photo: p });
            }
        }
        return list;
    }, [groupedPhotos, years]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => Math.min(prev + 12, flatPhotos.length));
                }
            },
            { rootMargin: '200px', threshold: 0.1 }
        );
        const sentinel = document.getElementById('load-more-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }
        return () => observer.disconnect();
    }, [flatPhotos.length]);

    // Close modal when hitting ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedPhoto(null);
            }
        };
        if (selectedPhoto) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [selectedPhoto]);

    const visiblePhotosList = flatPhotos.slice(0, visibleCount);
    const visibleGroups = visiblePhotosList.reduce((acc, item) => {
        if (!acc[item.year]) acc[item.year] = [];
        acc[item.year].push(item.photo);
        return acc;
    }, {} as Record<number, Photo[]>);

    const visibleYears = Object.keys(visibleGroups)
        .map(Number)
        .sort((a, b) => b - a);

    return (
        <>
            <div className="timeline">
                {visibleYears.map((year) => (
                    <section key={year} className="year-section" id={`year-${year}`}>
                        <h2 className="year-title">{year}</h2>
                        <div className="photo-grid">
                            {visibleGroups[year].map((photo: Photo) => {
                                const dateObj = new Date(photo.date);
                                return (
                                    <div key={photo.id} className="photo-card" onClick={() => setSelectedPhoto(photo)} role="button" tabIndex={0}>
                                        <LazyMedia photo={photo} year={year} />
                                        <p className="photo-date">
                                            {dateObj.toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>

            {visibleCount < flatPhotos.length && (
                <div id="load-more-sentinel" className="loading-sentinel" aria-hidden="true" />
            )}

            {selectedPhoto && (
                <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
                    <button className="modal-close" onClick={() => setSelectedPhoto(null)} aria-label="Close modal">
                        &times;
                    </button>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {selectedPhoto.url.includes('.mp4') ? (
                            <video
                                src={selectedPhoto.url}
                                controls
                                playsInline
                                className="modal-img"
                                autoPlay
                            />
                        ) : (
                            <img
                                src={selectedPhoto.url}
                                alt="Enlarged view"
                                className="modal-img"
                            />
                        )}
                        <PhotoComments photoId={selectedPhoto.id} />
                        <div className="modal-footer">
                            <p className="modal-date">
                                {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
