interface Date {
    minValue: Date;
    addDays(days: number): Date;
    addMinutes(mins: number): Date;
    addSeconds(secs: number): Date;
    diffDays(date: Date): number;
    diffHours(date: Date): number;
    diffMinutes(date: Date): number;
    diffSeconds(date: Date): number;
}
