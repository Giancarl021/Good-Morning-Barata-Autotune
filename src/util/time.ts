import { mySql } from '@azure/functions/types/app';

export function milliseconds(ms: number): number {
    return ms;
}

export function seconds(s: number): number {
    return 1000 * milliseconds(s);
}

export function minutes(m: number): number {
    return 60 * seconds(m);
}

export function hours(h: number): number {
    return 60 * minutes(h);
}

export function days(d: number): number {
    return 24 * hours(d);
}
