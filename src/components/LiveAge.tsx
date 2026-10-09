'use client';

import React, { useEffect, useState } from 'react';
import { formatAge } from '../lib/age';

export default function LiveAge() {
    const [ageString, setAgeString] = useState('');

    useEffect(() => {
        const updateAge = () => {
            setAgeString(formatAge(new Date()));
        };

        updateAge();
        // Update every minute to be safe
        const interval = setInterval(updateAge, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!ageString) return null;

    return (
        <p className="subtitle" style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
            {ageString}
        </p>
    );
}
