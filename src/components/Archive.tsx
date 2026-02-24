import React from 'react';
import { HardDrive } from 'lucide-react';

interface ArchiveProps {
    years: string[];
    onSelectYear: (year: string) => void;
}

export const Archive: React.FC<ArchiveProps> = ({ years, onSelectYear }) => {
    if (years.length === 0) {
        return (
            <div className="empty-state glass">
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>No archived memories</h3>
                <p style={{ marginTop: '0.5rem' }}>Photos from previous years will appear here as time passes.</p>
            </div>
        );
    }

    return (
        <div className="archive-grid animate-fade-in">
            {years.map(year => (
                <div key={year} className="usb-drive-card glass" onClick={() => onSelectYear(year)}>
                    <div className="usb-icon-container">
                        <HardDrive size={40} strokeWidth={1.5} />
                    </div>
                    <div className="usb-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text)' }}>
                            Tessa's memories from {year}
                        </h3>
                        <p style={{ margin: 0, color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Drive / {year} Archive
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
