import constants from '../util/constants';
import type {
    AccessTokenResponse,
    Credentials
} from 'graph-interface/lib/src/interfaces';
import type { AzureTablesInstance } from './AzureTables';
import type TokenEntity from '../interfaces/TokenEntity';

export default function AzureTablesAuthenticationProvider(
    azureTables: AzureTablesInstance
) {
    function _getRelativeExpiration(expiresAt: string): number {
        const expiresDate = new Date(expiresAt);
        const now = new Date();
        return Math.floor((expiresDate.getTime() - now.getTime()) / 1000);
    }

    function _tokenResponse(entity: TokenEntity): AccessTokenResponse {
        const relativeExpiration = _getRelativeExpiration(entity.expiresAt);

        return {
            tokenType: 'Bearer',
            accessToken: entity.value,
            expiresIn: relativeExpiration,
            extExpiresIn: relativeExpiration
        };
    }

    async function getToken(
        credentials: Credentials
    ): Promise<AccessTokenResponse> {
        const accessTokenEntity = await azureTables.getToken('AccessToken');

        if (accessTokenEntity) {
            return _tokenResponse(accessTokenEntity);
        }

        const refreshToken = await azureTables.getToken('RefreshToken');

        if (!refreshToken) {
            throw new Error('No valid access token or refresh token found.');
        }

        const response = await fetch(
            `https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: credentials.clientId,
                    client_secret: credentials.clientSecret,
                    refresh_token: refreshToken.value,
                    redirect_uri: constants.authentication.callbackUrl,
                    grant_type: 'refresh_token',
                    scope: constants.authentication.scopes.join(' ')
                }).toString()
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to refresh access token: ${response.status} ${response.statusText}`
            );
        }

        const tokenResponse = (await response.json()) as Record<string, string>;

        const newAccessToken: TokenEntity = {
            rowKey: 'AccessToken',
            value: tokenResponse['access_token'],
            expiresAt: new Date(
                Date.now() + Number(tokenResponse['expires_in']) * 1000
            ).toISOString()
        };

        await azureTables.setToken(newAccessToken);

        await azureTables.setToken({
            rowKey: 'RefreshToken',
            value: tokenResponse['refresh_token'],
            expiresAt: new Date(
                Date.now() + 48 * 60 * 60 * 1000 // 48 hours
            ).toISOString()
        });

        return _tokenResponse(newAccessToken);
    }

    return getToken;
}
