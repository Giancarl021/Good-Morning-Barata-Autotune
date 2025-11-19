import Email from '../interfaces/Email';
import constants from '../util/constants';
import getGifUrl from '../util/getGifUrl';
import getRandomPhrase from '../util/getRandomPhrase';

export default function EmailBuilder() {
    if (!constants.email.to || constants.email.to.length === 0) {
        throw new Error('Recipient email(s) are not defined.');
    }

    function getSubject() {
        return constants.email.subject;
    }

    function getBody() {
        const gifUrl = getGifUrl();
        const phrase = getRandomPhrase();

        return `
            <html>
                <body>
                    ${
                        constants.sendRandomPhrase
                            ? `
                            <h3>
                                ${phrase.text}
                            </h3>
                            <em>- ${phrase.author}</em>
                            <br/>
                            <br/>`
                            : ''
                    }
                    <img src="${gifUrl}" alt="Daily GIF" />
                </body>
            </html>
        `;
    }

    function getTo() {
        return constants.email.to;
    }

    function getEmail(): Email {
        return {
            to: getTo(),
            subject: getSubject(),
            body: getBody()
        };
    }

    return {
        getSubject,
        getBody,
        getTo,
        getEmail
    };
}
