import React from 'react';
import type { PhotoData } from '../data/types';
import { ImageIcon } from 'lucide-react';

interface GalleryProps {
    photos: PhotoData[];
    onPhotoClick: (photo: PhotoData) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ photos, onPhotoClick }) => {
    if (photos.length === 0) {
        return (
            <div className="empty-state glass">
                <ImageIcon size={64} opacity={0.2} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>No memory captures yet</h3>
                <p style={{ marginTop: '0.5rem' }}>Upload photos to see them here.</p>
            </div>
        );
    }

    return (
        <div className="photo-grid animate-fade-in">
            {photos.map(photo => (
                <div key={photo.id} className="photo-thumbnail glass" onClick={() => onPhotoClick(photo)}>
                    <img src={photo.url} alt={photo.caption || 'Memory'} loading="lazy" />
                    <div className="thumbnail-overlay">
                        <span style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)' }}>View Map & Date</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
