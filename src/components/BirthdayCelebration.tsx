'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function BirthdayCelebration() {
    const [isBirthday, setIsBirthday] = useState(false);

    useEffect(() => {
        const today = new Date();
        const month = today.getMonth(); // 0 is January, 1 is Feb
        const date = today.getDate();

        // Check if it's Feb 13th
        if (month === 1 && date === 13) {
            setIsBirthday(true);

            // Launch confetti!
            const duration = 15 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            return () => clearInterval(interval);
        }
    }, []);

    if (!isBirthday) return null;

    return (
        <div className="birthday-balloons-container" aria-hidden="true">
            <div className="balloon balloon-1">🎈</div>
            <div className="balloon balloon-2">🎈</div>
            <div className="balloon balloon-3">🎈</div>
            <div className="balloon balloon-4">🎈</div>
            <div className="balloon balloon-5">🎈</div>
            <div className="balloon balloon-6">🎀</div>
        </div>
    );
}
