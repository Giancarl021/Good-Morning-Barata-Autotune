import { app, type InvocationContext, type Timer } from '@azure/functions';
import constants from '../util/constants';
import AzureTablesAuthenticationProvider from '../services/AzureTablesAuthenticationProvider';
import AzureTables from '../services/AzureTables';

export async function refreshTokens(
    timer: Timer,
    context: InvocationContext
): Promise<void> {
    if (timer.isPastDue) {
        context.log(
            'Timer function is running late at:',
            new Date().toISOString()
        );
    }

    const azureTables = AzureTables();
    const provider = AzureTablesAuthenticationProvider(azureTables);

    await provider.refreshToken(constants.authentication.credentials);

    context.log('Timer function processed request.');
}

app.timer('refreshTokens', {
    schedule: constants.refreshTokenSchedule,
    handler: refreshTokens
});
