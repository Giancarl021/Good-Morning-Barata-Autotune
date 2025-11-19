import { randomBytes } from 'crypto';
import constants from './constants';
import randomItem from './random';

interface Phrase {
    text: string;
    author: string;
}

export default function getRandomPhrase(): Phrase {
    const phrase = randomItem(constants.phrases);

    return {
        author: phrase.autor,
        text: phrase.frase
    };
}
