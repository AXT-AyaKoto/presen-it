/** Horizontal slide padding as a fraction of slide height (matches theme `--presenit-slide-padding`). */
export const SLIDE_PADDING_RATIO = 0.045;

/** Click zone width as a fraction of slide width — slightly narrower than horizontal padding. */
export function clickZoneWidthRatio(width: number, height: number): number {
    return (height * SLIDE_PADDING_RATIO * 0.9) / width;
}
