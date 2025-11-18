import { randomBytes } from 'crypto';
import constants from './constants';

export default function getGifUrl(): string {
    const { alternativeProbability, sources } = constants.gifs;

    const useAlternative = randomBytes(1).at(0) / 255 < alternativeProbability;

    if (!useAlternative) {
        return sources.default;
    }

    const alternatives = sources.alternatives;
    const randomIndex =
        ((randomBytes(1).at(0) / 255) * alternatives.length) %
        alternatives.length;

    return alternatives[randomIndex];
}
