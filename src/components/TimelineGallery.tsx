'use client';

import React, { useState, useEffect } from 'react';
import type { Photo } from '../lib/icloud';

interface TimelineGalleryProps {
    groupedPhotos: Record<number, Photo[]>;
    years: number[];
}

export default function TimelineGallery({ groupedPhotos, years }: TimelineGalleryProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    // Close modal when hitting ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedPhoto(null);
            }
        };
        if (selectedPhoto) {
            document.addEventListener('keydown', handleKeyDown);
            // Disable scrolling on background
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [selectedPhoto]);

    return (
        <>
            <div className="timeline">
                {years.map((year) => (
                    <section key={year} className="year-section" id={`year-${year}`}>
                        <h2 className="year-title">{year}</h2>
                        <div className="photo-grid">
                            {groupedPhotos[year].map((photo: Photo) => {
                                // Next.js boundary wraps dates as ISO strings depending on environment
                                const dateObj = new Date(photo.date);
                                return (
                                    <div key={photo.id} className="photo-card" onClick={() => setSelectedPhoto(photo)} role="button" tabIndex={0}>
                                        <picture className="photo-container">
                                            {/* Fallback to simple img tag for remote iCloud URLs to bypass extra config overhead */}
                                            <img
                                                src={photo.url}
                                                alt={`Photo taken in ${year}`}
                                                loading="lazy"
                                                className="photo-img interactive-img"
                                            />
                                        </picture>
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

            {selectedPhoto && (
                <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
                    <button className="modal-close" onClick={() => setSelectedPhoto(null)} aria-label="Close modal">
                        &times;
                    </button>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedPhoto.url}
                            alt="Enlarged view"
                            className="modal-img"
                        />
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
