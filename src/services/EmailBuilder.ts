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
                            <h2>
                                ${phrase.text}
                            </h2>
                            <br/>
                            <h3 style="margin-left: auto">
                                - ${phrase.author}
                            </h3>
                            <br/>
                            <br/>`
                            : ''
                    }
                    <b>Um bom dia!</b>
                    <br/>
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
