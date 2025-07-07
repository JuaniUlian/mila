
export const getPageBackgroundClass = (score: number | null, isInitial: boolean): string => {
    if (isInitial || score === null) {
        return 'from-slate-200/50 via-slate-100/50 to-white';
    }
    // Grave: Red tones
    if (score < 40) return 'from-red-400/40 via-red-100/40 to-white';
    // Medium: Amber tones
    if (score < 75) return 'from-amber-400/40 via-amber-100/40 to-white';
    // Good: Green tones
    if (score < 100) return 'from-green-400/40 via-green-100/40 to-white';
    // Perfect: Special celebratory/calm color
    return 'from-sky-400/40 via-sky-100/40 to-white';
};

export const getHeaderBackgroundClass = (score: number | null, isInitial: boolean): string => {
    const defaultClass = 'bg-slate-100/60';
    if (isInitial || score === null) return defaultClass;

    if (score < 40) return 'bg-red-200/60';
    if (score < 75) return 'bg-amber-200/60';
    if (score < 100) return 'bg-green-200/60';
    return 'bg-sky-200/60'; // Perfect score
};
