import { DefaultAzureCredential } from '@azure/identity';
import { TableClient } from '@azure/data-tables';
import constants from '../util/constants';
import type {
    AccessTokenResponse,
    Credentials
} from 'graph-interface/lib/src/interfaces';

const credential = new DefaultAzureCredential();

interface TokenEntity {
    value: string;
    expiresAt: string;
}

export default function AzureTablesAuthenticationProvider() {
    const tableClient = new TableClient(
        `https://${constants.authentication.storageAccountName}.table.core.windows.net`,
        constants.authentication.tableName,
        credential
    );

    function isTokenExpired(token: TokenEntity): boolean {
        const expiresAt = new Date(token.expiresAt);
        const now = new Date();
        return now >= expiresAt;
    }

    function getRelativeExpiration(expiresAt: string): number {
        const expiresDate = new Date(expiresAt);
        const now = new Date();
        return Math.floor((expiresDate.getTime() - now.getTime()) / 1000);
    }

    async function getTokenEntity(
        type: 'AccessToken' | 'RefreshToken'
    ): Promise<TokenEntity | undefined> {
        const entity: TokenEntity = await tableClient
            .getEntity('Tokens', type)
            .catch(() => undefined);

        if (entity && !isTokenExpired(entity)) {
            return entity;
        }
    }

    function toTokenResponse(entity: TokenEntity): AccessTokenResponse {
        const relativeExpiration = getRelativeExpiration(entity.expiresAt);

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
        await tableClient.createTable().catch(() => {});

        const accessTokenEntity = await getTokenEntity('AccessToken');

        if (accessTokenEntity) {
            return toTokenResponse(accessTokenEntity);
        }

        const refreshToken = await getTokenEntity('RefreshToken');

        if (!refreshToken) {
            throw new Error('No valid access token or refresh token found.');
        }

        await fetch(
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
                    redirect_uri: `http://localhost:${''}`,
                    grant_type: 'refresh_token',
                    scope: 'https://graph.microsoft.com/.default offline_access'
                })
            }
        );

        return {} as any;
    }

    return getToken;
}
