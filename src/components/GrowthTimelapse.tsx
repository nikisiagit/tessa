'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { TimelapseFrame } from '../lib/timelapse';

const HOLD_MS = 700;
const FADE_MS = 400;

interface GrowthTimelapseProps {
    frames: TimelapseFrame[];
}

export default function GrowthTimelapse({ frames }: GrowthTimelapseProps) {
    const [index, setIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState<number | null>(null);
    const [playing, setPlaying] = useState(false);
    const indexRef = useRef(0);

    useEffect(() => {
        indexRef.current = index;
    }, [index]);

    useEffect(() => {
        if (frames.length < 2) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const id = window.requestAnimationFrame(() => setPlaying(true));
        return () => window.cancelAnimationFrame(id);
    }, [frames.length]);

    useEffect(() => {
        if (frames.length < 2) return;
        const next = frames[(index + 1) % frames.length];
        const img = new Image();
        img.src = next.url;
    }, [frames, index]);

    useEffect(() => {
        if (previousIndex === null) return;
        const timer = window.setTimeout(() => setPreviousIndex(null), FADE_MS);
        return () => window.clearTimeout(timer);
    }, [previousIndex, index]);

    useEffect(() => {
        if (!playing || frames.length < 2) return;
        const timer = window.setInterval(() => {
            const current = indexRef.current;
            const next = (current + 1) % frames.length;
            indexRef.current = next;
            setPreviousIndex(current);
            setIndex(next);
        }, HOLD_MS + FADE_MS);
        return () => window.clearInterval(timer);
    }, [playing, frames.length]);

    if (frames.length === 0) {
        return (
            <div className="empty-state">
                <p>No still photos yet for a time-lapse.</p>
            </div>
        );
    }

    const frame = frames[index];
    const taken = new Date(frame.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const step = (delta: number) => {
        setPlaying(false);
        const current = indexRef.current;
        const next = (current + delta + frames.length) % frames.length;
        if (next !== current) setPreviousIndex(current);
        indexRef.current = next;
        setIndex(next);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === ' ') {
            event.preventDefault();
            if (frames.length > 1) setPlaying((value) => !value);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            step(1);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            step(-1);
        }
    };

    return (
        <section
            className="timelapse"
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label="Growth time-lapse"
        >
            <div className="timelapse-stage">
                {previousIndex !== null && (
                    <img
                        src={frames[previousIndex].url}
                        alt=""
                        className="timelapse-frame is-under"
                    />
                )}
                <img
                    key={frame.id}
                    src={frame.url}
                    alt={`${frame.label}, ${taken}`}
                    className={`timelapse-frame ${previousIndex !== null ? 'is-incoming' : 'is-current'}`}
                />
            </div>

            <p className="timelapse-age">{frame.label}</p>
            <p className="timelapse-date">{taken}</p>

            <div className="timelapse-controls">
                <button
                    type="button"
                    className="timelapse-play"
                    onClick={() => setPlaying((value) => !value)}
                    disabled={frames.length < 2}
                >
                    {playing ? 'Pause' : 'Play'}
                </button>
                <input
                    className="timelapse-scrub"
                    type="range"
                    min={0}
                    max={Math.max(frames.length - 1, 0)}
                    value={index}
                    aria-label="Week of the time-lapse"
                    aria-valuetext={`Week ${frame.weekIndex + 1}, ${frame.label}`}
                    onChange={(event) => {
                        const next = Number(event.target.value);
                        setPlaying(false);
                        setPreviousIndex(null);
                        indexRef.current = next;
                        setIndex(next);
                    }}
                    disabled={frames.length < 2}
                />
                <p className="timelapse-count">
                    Week {frame.weekIndex + 1}
                    <span> · {index + 1} of {frames.length}</span>
                </p>
            </div>
        </section>
    );
}
