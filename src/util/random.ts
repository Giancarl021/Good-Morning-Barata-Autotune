import { getRandomValues } from 'crypto';

export function randomValue(min: number, max: number): number {
    const random = getRandomValues(new Uint32Array(1))[0];
    return Math.floor((random / 0xffffffff) * (max - min)) + min;
}

export default function randomItem<T>(items: T[]): T {
    const index = randomValue(0, items.length);
    return items[index];
}
