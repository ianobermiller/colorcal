// https://colorbrewer2.org/#type=qualitative&scheme=Set2&n=6
export const COLORS = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'];

const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
export function getColorForMode(color: string | undefined): string | undefined {
    if (!color || !isDark) return color;

    return `color-mix(in hsl, ${color}, #000)`;
}
