import {
    app,
    HttpRequest,
    HttpResponseInit,
    InvocationContext
} from '@azure/functions';

export async function updateToken(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get('name') || (await request.text()) || 'world';

    return { body: `Hello, ${name}!` };
}

app.http('updateToken', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: updateToken
});
