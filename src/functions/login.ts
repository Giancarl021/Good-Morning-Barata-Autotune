import {
    app,
    type HttpRequest,
    type HttpResponseInit,
    type InvocationContext
} from '@azure/functions';
import OAuth from '../services/OAuth';
import AzureTables from '../services/AzureTables';

export async function login(
    _request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    context.log('Processing login request');

    const azureTables = AzureTables();
    const state = await azureTables.setState();
    const oAuth = OAuth(state);

    return {
        status: 302,
        headers: {
            Location: oAuth.getCodeUri()
        }
    };
}

app.http('login', {
    methods: ['GET'],
    authLevel: 'function',
    handler: login
});
