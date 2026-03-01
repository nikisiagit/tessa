'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Photo } from '../lib/icloud';
import PhotoComments from './PhotoComments';

interface TimelineGalleryProps {
    photos: Photo[];
}

function LazyMedia({ photo, title }: { photo: Photo; title: string }) {
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
                    alt={`Photo from ${title}`}
                    loading="lazy"
                    className={`photo-img interactive-img ${loaded ? 'loaded' : ''}`}
                    onLoad={() => setLoaded(true)}
                />
            )}
        </picture>
    );
}

export default function TimelineGallery({ photos }: TimelineGalleryProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => Math.min(prev + 12, photos.length));
                }
            },
            { rootMargin: '200px', threshold: 0.1 }
        );
        const sentinel = document.getElementById('load-more-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }
        return () => observer.disconnect();
    }, [photos.length]);

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

    const visiblePhotosList = photos.slice(0, visibleCount);

    // Group by YYYY-MM
    const visibleGroups = visiblePhotosList.reduce((acc, photo) => {
        const d = new Date(photo.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(photo);
        return acc;
    }, {} as Record<string, Photo[]>);

    // Sort groups descending (newest month first)
    const sortedGroupKeys = Object.keys(visibleGroups).sort((a, b) => b.localeCompare(a));

    return (
        <>
            <div className="timeline">
                {sortedGroupKeys.map((monthKey) => {
                    const [year, month] = monthKey.split('-');
                    const dateObj = new Date(parseInt(year), parseInt(month) - 1);
                    const groupTitle = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

                    return (
                        <section key={monthKey} className="year-section" id={`month-${monthKey}`}>
                            <h2 className="year-title">{groupTitle}</h2>
                            <div className="photo-grid">
                                {visibleGroups[monthKey].map((photo: Photo) => {
                                    const pDate = new Date(photo.date);
                                    return (
                                        <div key={photo.id} className="photo-card" onClick={() => setSelectedPhoto(photo)} role="button" tabIndex={0}>
                                            <LazyMedia photo={photo} title={groupTitle} />
                                            <p className="photo-date">
                                                {pDate.toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <PhotoComments
                                                photoId={photo.id}
                                                isFeed={true}
                                                onCommentsClick={() => setSelectedPhoto(photo)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>

            {visibleCount < photos.length && (
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
