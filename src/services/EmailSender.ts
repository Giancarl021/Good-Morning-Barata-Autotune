import GraphInterface from 'graph-interface';
import AzureTablesAuthenticationProvider from './AzureTablesAuthenticationProvider';
import Email from '../interfaces/Email';
import constants from '../util/constants';

export default function EmailSender() {
    const graph = GraphInterface(constants.authentication.credentials, {
        authenticationProvider: AzureTablesAuthenticationProvider()
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
