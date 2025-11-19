import GraphInterface from 'graph-interface';
import AzureTablesAuthenticationProvider from './AzureTablesAuthenticationProvider';
import Email from '../interfaces/Email';
import constants from '../util/constants';
import AzureTables from './AzureTables';

export default function EmailSender() {
    const azureTables = AzureTables();
    const graph = GraphInterface(constants.authentication.credentials, {
        authenticationProvider: AzureTablesAuthenticationProvider(azureTables),
        cacheAccessTokenByDefault: false
    });

    async function sendEmail(email: Email): Promise<void> {
        await graph.unit('me/sendMail', {
            method: 'POST',
            body: {
                message: {
                    subject: email.subject,
                    body: {
                        contentType: 'html',
                        content: email.body
                    },
                    toRecipients: email.to.map(email => ({
                        emailAddress: {
                            address: email
                        }
                    }))
                }
            }
        });
    }

    return {
        sendEmail
    };
}
