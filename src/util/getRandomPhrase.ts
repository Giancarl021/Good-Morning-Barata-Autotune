import { randomBytes } from 'crypto';
import constants from './constants';

interface Phrase {
    text: string;
    author: string;
}

export default function getRandomPhrase(): Phrase {
    const index =
        ((randomBytes(1).at(0) / 255) * constants.phrases.length) %
        constants.phrases.length;

    const phrase = constants.phrases[index];

    return {
        author: phrase.autor,
        text: phrase.frase
    };
}
