import React, { useEffect } from 'react';
import type { PhotoData } from '../data/types';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { X, Calendar, MapPin, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const customIcon = new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="
    background-color: var(--color-primary);
    width: 24px;
    height: 24px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    border: 3px solid white;
  "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});

// Helper component to fix map rendering issues inside modals
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
        map.flyTo(center, 13, { duration: 0 });
    }, [map, center]);
    return null;
};

interface PhotoModalProps {
    photo: PhotoData | null;
    onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose }) => {
    if (!photo) return null;

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="modal-content glass" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}><X size={24} /></button>

                <div className="modal-split">
                    <div className="modal-photo">
                        <img src={photo.url} alt={photo.caption || 'Memory'} />
                    </div>

                    <div className="modal-info">
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: 0 }}>
                            {photo.caption || 'Beautiful Memory'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <div className="icon-badge"><Calendar size={18} /></div>
                                <span style={{ fontSize: '1.1rem' }}>{format(new Date(photo.date), 'MMMM do, yyyy - h:mm a')}</span>
                            </div>

                            {photo.location.name && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text)' }}>
                                    <div className="icon-badge"><MapPin size={18} /></div>
                                    <span style={{ fontSize: '1.1rem' }}>{photo.location.name}</span>
                                </div>
                            )}

                            {photo.bbcHeadline && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text)', marginTop: '0.5rem', background: 'rgba(214, 168, 164, 0.05)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(214, 168, 164, 0.2)' }}>
                                    <div className="icon-badge" style={{ background: '#B80000', color: 'white', width: 28, height: 28, minWidth: 28 }}><Newspaper size={14} /></div>
                                    <div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>BBC News that day:</span>
                                        <h4 style={{ fontSize: '1rem', marginTop: '0.2rem', fontFamily: 'var(--font-serif)', lineHeight: 1.4, color: 'var(--color-text)' }}>"{photo.bbcHeadline}"</h4>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-map-container">
                            <MapContainer
                                center={[photo.location.lat, photo.location.lng]}
                                zoom={13}
                                style={{ height: '100%', width: '100%', borderRadius: 'var(--border-radius-md)' }}
                                zoomControl={false}
                            >
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                <Marker position={[photo.location.lat, photo.location.lng]} icon={customIcon} />
                                <MapUpdater center={[photo.location.lat, photo.location.lng]} />
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
