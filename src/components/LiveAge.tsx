'use client';

import React, { useEffect, useState } from 'react';

export default function LiveAge() {
    const [ageString, setAgeString] = useState('');

    useEffect(() => {
        // Tessa's birth date: 13th Feb 2026 at 1:48am GMT
        const birthDate = new Date(Date.UTC(2026, 1, 13, 1, 48, 0));

        const updateAge = () => {
            const now = new Date();
            const diffInMilliseconds = now.getTime() - birthDate.getTime();

            if (diffInMilliseconds < 0) {
                setAgeString('not born yet');
                return;
            }

            // Calculate exact time units
            const totalDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

            // Basic estimation for years/months/days for display
            const years = Math.floor(totalDays / 365);
            let remainingDays = totalDays % 365;

            // Approximate months (average 30.44 days)
            const months = Math.floor(remainingDays / 30.44);
            remainingDays = Math.floor(remainingDays % 30.44);

            const parts = [];
            if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
            if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
            if (remainingDays > 0 || (years === 0 && months === 0)) {
                parts.push(`${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`);
            }

            setAgeString(parts.join(', ') + ' old');
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
