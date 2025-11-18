import { app, type InvocationContext, type Timer } from '@azure/functions';
import constants from '../util/constants';
import EmailBuilder from '../services/EmailBuilder';
import EmailSender from '../services/EmailSender';

export async function sendEmails(
    timer: Timer,
    context: InvocationContext
): Promise<void> {
    if (timer.isPastDue) {
        context.log(
            'Timer function is running late at:',
            new Date().toISOString()
        );
    }

    const builder = EmailBuilder();
    const sender = EmailSender();

    const email = builder.getEmail();
    await sender.sendEmail(email);

    context.log('Timer function processed request.');
}

app.timer('sendEmails', {
    schedule: constants.schedule,
    handler: sendEmails
});
