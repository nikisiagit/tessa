import React, { useEffect, useRef } from 'react';
import type { PhotoData } from '../data/types';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';

interface TimelineProps {
    photos: PhotoData[];
    activePhotoId: string | null;
    onActiveChange: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ photos, activePhotoId, onActiveChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    onActiveChange(entry.target.getAttribute('data-id') || '');
                }
            });
        }, {
            root: containerRef.current?.parentElement,
            threshold: 0.5,
            rootMargin: '-20% 0px -40% 0px'
        });

        const elements = document.querySelectorAll('.timeline-item');
        elements.forEach(el => observerRef.current?.observe(el));

        return () => observerRef.current?.disconnect();
    }, [onActiveChange, photos]);

    return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative' }}>
            {/* Vertical line connection */}
            <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '1.5rem',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--color-primary), var(--color-secondary))',
                zIndex: 0,
                opacity: 0.3
            }} />

            {photos.map((photo, index) => {
                const isActive = activePhotoId === photo.id;

                return (
                    <div
                        key={photo.id}
                        data-id={photo.id}
                        className="timeline-item"
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            opacity: isActive ? 1 : 0.6,
                            transform: isActive ? 'scale(1)' : 'scale(0.98)',
                            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                            zIndex: 1,
                            marginTop: index === 0 ? '1rem' : 0
                        }}
                    >
                        {/* Timeline Dot */}
                        <div style={{
                            position: 'absolute',
                            left: '1.5rem',
                            top: '2rem',
                            transform: 'translate(-50%, -50%)',
                            width: isActive ? '20px' : '12px',
                            height: isActive ? '20px' : '12px',
                            borderRadius: '50%',
                            background: isActive ? 'var(--color-accent)' : 'var(--color-primary)',
                            boxShadow: isActive ? '0 0 0 6px rgba(229, 168, 105, 0.2)' : 'none',
                            transition: 'all 0.3s',
                            zIndex: 2
                        }} />

                        {/* Content card */}
                        <div
                            className="glass"
                            style={{
                                marginLeft: '3.5rem',
                                padding: '1.25rem',
                                background: isActive ? 'var(--color-surface)' : 'rgba(255, 255, 255, 0.4)',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                borderRadius: 'var(--border-radius-lg)',
                                boxShadow: isActive ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                            }}
                            onClick={() => onActiveChange(photo.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                                    {format(new Date(photo.date), 'MMMM do, yyyy')}
                                </span>

                                {photo.location.name && (
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        fontSize: '0.8rem',
                                        color: 'var(--color-text-muted)',
                                        background: 'rgba(0,0,0,0.03)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: 'var(--border-radius-full)'
                                    }}>
                                        <MapPin size={12} /> {photo.location.name}
                                    </span>
                                )}
                            </div>

                            <div style={{
                                width: '100%',
                                height: '240px',
                                borderRadius: 'var(--border-radius-md)',
                                overflow: 'hidden',
                                marginBottom: '1rem',
                                position: 'relative'
                            }}>
                                <img
                                    src={photo.url}
                                    alt={photo.caption}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                        transition: 'transform 1s ease-out'
                                    }}
                                />
                            </div>

                            <h3 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.25rem',
                                color: 'var(--color-text)',
                                lineHeight: 1.4,
                                margin: 0
                            }}>
                                {photo.caption}
                            </h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
