import { BIRTH_DATE, WEEK_MS, formatAge } from './age';

export interface TimelapseSourcePhoto {
    id: string;
    url: string;
    thumbnailUrl: string;
    date: Date | string;
}

export interface TimelapseFrame {
    id: string;
    url: string;
    thumbnailUrl: string;
    date: string;
    label: string;
    weekIndex: number;
}

function isStill(photo: TimelapseSourcePhoto): boolean {
    return !photo.url.includes('.mp4') && !photo.thumbnailUrl.includes('.mp4');
}

/**
 * One still per week of age. The photo closest to the middle of the week wins.
 * Weeks with no stills are skipped.
 */
export function selectFrames(
    photos: TimelapseSourcePhoto[],
    birth: Date = BIRTH_DATE,
): TimelapseFrame[] {
    const birthMs = birth.getTime();
    const bestByWeek = new Map<number, { photo: TimelapseSourcePhoto; time: number; distance: number }>();

    for (const photo of photos) {
        if (!isStill(photo)) continue;

        const time = new Date(photo.date).getTime();
        if (Number.isNaN(time) || time < birthMs) continue;

        const weekIndex = Math.floor((time - birthMs) / WEEK_MS);
        const midpoint = birthMs + (weekIndex + 0.5) * WEEK_MS;
        const distance = Math.abs(time - midpoint);
        const current = bestByWeek.get(weekIndex);

        if (!current || distance < current.distance || (distance === current.distance && time < current.time)) {
            bestByWeek.set(weekIndex, { photo, time, distance });
        }
    }

    return Array.from(bestByWeek.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([weekIndex, chosen]) => {
            const at = new Date(chosen.time);
            return {
                id: chosen.photo.id,
                url: chosen.photo.url,
                thumbnailUrl: chosen.photo.thumbnailUrl,
                date: at.toISOString(),
                label: formatAge(at, birth),
                weekIndex,
            };
        });
}
