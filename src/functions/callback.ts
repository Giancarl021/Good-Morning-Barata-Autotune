import {
    app,
    HttpRequest,
    HttpResponseInit,
    InvocationContext
} from '@azure/functions';
import OAuth from '../services/OAuth';
import AzureTables from '../services/AzureTables';

export async function updateToken(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    context.log('Processing callback request');

    const code = request.query.get('code');
    const state = request.query.get('state');

    if (!code) {
        return {
            status: 400,
            jsonBody: {
                error: 'Code is missing'
            }
        };
    }

    if (!state) {
        return {
            status: 400,
            jsonBody: {
                error: 'State is missing'
            }
        };
    }

    const azureTables = AzureTables();
    const isValidState = await azureTables.validateState(state);

    if (!isValidState) {
        return {
            status: 400,
            jsonBody: {
                error: 'Invalid state'
            }
        };
    }

    const oAuth = OAuth(state);

    const token = await oAuth.getToken(code);
    await azureTables.setTokens(token);

    return {
        status: 200,
        body: 'Authentication successful. You can close this window.'
    };
}

app.http('callback', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: updateToken
});
