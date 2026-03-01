import React from 'react';

export default function Loading() {
    return (
        <div className="container loading-overlay">
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', letterSpacing: '1px' }}>
                loading photos...
            </p>
        </div>
    );
}
