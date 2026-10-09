/** Tessa's birth date: 13 February 2026 at 1:48am GMT. */
export const BIRTH_DATE = new Date(Date.UTC(2026, 1, 13, 1, 48, 0));

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Age label used on the home page and on each time-lapse frame. */
export function formatAge(at: Date, birth: Date = BIRTH_DATE): string {
    const diffInMilliseconds = at.getTime() - birth.getTime();

    if (diffInMilliseconds < 0) {
        return 'not born yet';
    }

    const totalDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    let remainingDays = totalDays % 365;
    const months = Math.floor(remainingDays / 30.44);
    remainingDays = Math.floor(remainingDays % 30.44);

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (remainingDays > 0 || (years === 0 && months === 0)) {
        parts.push(`${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`);
    }

    return parts.join(', ') + ' old';
}
