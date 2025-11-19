import constants from './constants';
import randomItem, { randomValue } from './random';

export default function getGifUrl(): string {
    const { alternativeProbability, sources } = constants.gifs;

    const useAlternative = randomValue(0, 100) / 100 < alternativeProbability;

    if (!useAlternative) {
        return sources.default;
    }

    const alternatives = sources.alternatives as unknown as string[];

    return randomItem(alternatives);
}
