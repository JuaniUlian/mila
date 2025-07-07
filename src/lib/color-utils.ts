
export const getPageBackgroundClass = (score: number | null, isInitial: boolean): string => {
    if (isInitial || score === null) {
        return 'from-slate-200/50 via-slate-100/50 to-white';
    }
    if (score < 40) return 'from-rose-900/50 via-rose-100/50 to-white';
    if (score < 60) return 'from-orange-600/50 via-orange-100/50 to-white';
    if (score < 75) return 'from-amber-500/50 via-amber-100/50 to-white';
    if (score < 85) return 'from-lime-600/50 via-lime-100/50 to-white';
    if (score === 100) return 'from-slate-200/50 via-slate-100/50 to-white';
    if (score < 95) return 'from-blue-600/50 via-blue-100/50 to-white';
    return 'from-slate-500/50 via-slate-100/50 to-white'; // 95-99
};

export const getHeaderBackgroundClass = (score: number | null, isInitial: boolean): string => {
    const defaultClass = 'bg-slate-100/60';
    if (isInitial || score === null || score === 100) return defaultClass;
    
    if (score < 40) return 'bg-rose-200/70';
    if (score < 60) return 'bg-orange-200/70';
    if (score < 75) return 'bg-amber-200/70';
    if (score < 85) return 'bg-lime-200/70';
    if (score < 95) return 'bg-blue-200/70';
    return 'bg-slate-200/70'; // 95-99
};
