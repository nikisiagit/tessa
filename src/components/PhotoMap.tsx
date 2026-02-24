import React, { useEffect } from 'react';
import type { PhotoData } from '../data/types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Custom Icon for Active Map Marker
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

interface PhotoMapProps {
    photos: PhotoData[];
    activePhotoId: string | null;
    onPhotoSelect: (id: string) => void;
}

// Map Controller component to pan to the active photo
const MapController: React.FC<{ activePhoto: PhotoData | null }> = ({ activePhoto }) => {
    const map = useMap();

    useEffect(() => {
        if (activePhoto) {
            map.flyTo([activePhoto.location.lat, activePhoto.location.lng], 14, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [activePhoto, map]);

    return null;
};

export const PhotoMap: React.FC<PhotoMapProps> = ({ photos, activePhotoId, onPhotoSelect }) => {
    const activePhoto = photos.find(p => p.id === activePhotoId) || null;
    const defaultCenter = photos[0]?.location ? [photos[0].location.lat, photos[0].location.lng] : [51.505, -0.09];

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
            <MapContainer
                center={defaultCenter as [number, number]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {photos.map((photo) => {
                    return (
                        <Marker
                            key={photo.id}
                            position={[photo.location.lat, photo.location.lng]}
                            icon={customIcon}
                            eventHandlers={{
                                click: () => onPhotoSelect(photo.id)
                            }}
                        >
                            <Popup className="custom-popup">
                                <div style={{ width: '200px', padding: '0.25rem' }}>
                                    <img src={photo.url} alt="thumbnail" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontFamily: 'var(--font-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{new Date(photo.date).toLocaleDateString()}</p>
                                    {photo.location.name && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{photo.location.name}</p>}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <MapController activePhoto={activePhoto} />
            </MapContainer>

            {/* Pop up CSS Override inline to avoid global CSS clutter if preferred */}
            <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: var(--border-radius-md) !important;
          box-shadow: var(--shadow-md) !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(8px) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95) !important;
        }
        .custom-leaflet-icon {
          transition: transform 0.3s;
        }
        .custom-leaflet-icon:hover {
          transform: scale(1.2);
        }
      `}</style>
        </div>
    );
};
