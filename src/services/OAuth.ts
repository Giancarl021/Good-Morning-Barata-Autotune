import { AccessTokenResponse } from 'graph-interface/lib/src/interfaces';
import constants from '../util/constants';

export default function OAuth(state: string) {
    function getCodeUri(): string {
        const params = new URLSearchParams({
            state,
            client_id: constants.authentication.credentials.clientId,
            response_type: 'code',
            redirect_uri: constants.authentication.callbackUrl,
            response_mode: 'query',
            scope: constants.authentication.scopes.join(' ')
        });

        return (
            `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
            params.toString()
        );
    }

    async function getToken(code: string): Promise<Record<string, string>> {
        const params = new URLSearchParams({
            code,
            client_id: constants.authentication.credentials.clientId,
            client_secret: constants.authentication.credentials.clientSecret,
            scope: constants.authentication.scopes.join(' '),
            redirect_uri: constants.authentication.callbackUrl,
            grant_type: 'authorization_code'
        });

        const response = await fetch(
            `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to get token: ${response.status} ${response.statusText}`
            );
        }

        const data = (await response.json()) as Record<string, string>;

        return data;
    }

    return {
        getCodeUri,
        getToken
    };
}
