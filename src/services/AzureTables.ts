import { TableClient } from '@azure/data-tables';
import constants from '../util/constants';
import {
    ClientSecretCredential,
    DefaultAzureCredential,
    TokenCredential
} from '@azure/identity';
import type TokenEntity from '../interfaces/TokenEntity';
import { AccessTokenResponse } from 'graph-interface/lib/src/interfaces';
import { randomUUID } from 'crypto';
import { days, seconds } from '../util/time';

export type AzureTablesInstance = ReturnType<typeof AzureTables>;

export default function AzureTables() {
    const credential: TokenCredential = constants.authentication
        .storageAccountServicePrincipalAuthentication
        ? new ClientSecretCredential(
              constants.authentication.credentials.tenantId,
              constants.authentication.credentials.clientId,
              constants.authentication.credentials.clientSecret
          )
        : new DefaultAzureCredential();

    const tableClient = new TableClient(
        `https://${constants.authentication.storageAccountName}.table.core.windows.net`,
        constants.authentication.tableName,
        credential
    );

    function _isTokenExpired(token: TokenEntity): boolean {
        const expiresAt = new Date(token.expiresAt);
        const now = new Date();
        return now >= expiresAt;
    }

    async function getToken(
        type: TokenEntity['rowKey']
    ): Promise<TokenEntity | undefined> {
        await tableClient.createTable();
        const entity: TokenEntity = await tableClient
            .getEntity('Tokens', type)
            .catch(() => undefined);

        if (entity && !_isTokenExpired(entity)) {
            return entity;
        }
    }

    async function setToken(token: TokenEntity): Promise<void> {
        await tableClient.createTable();
        await tableClient.upsertEntity(
            {
                partitionKey: 'Tokens',
                ...token
            },
            'Replace'
        );
    }

    async function setState(): Promise<string> {
        const state = randomUUID();

        await tableClient.createTable();
        await tableClient.upsertEntity(
            {
                partitionKey: 'Tokens',
                rowKey: 'CurrentState',
                value: state
            },
            'Replace'
        );

        return state;
    }

    async function validateState(state: string): Promise<boolean> {
        await tableClient.createTable();
        const entity: TokenEntity = await tableClient
            .getEntity('Tokens', 'CurrentState')
            .catch(() => undefined);

        if (entity && entity.value === state) {
            return true;
        }

        return false;
    }

    async function setTokens(
        tokenResponse: Record<string, string>
    ): Promise<void> {
        if (
            !tokenResponse['access_token'] ||
            !tokenResponse['refresh_token'] ||
            !tokenResponse['expires_in']
        ) {
            throw new Error('Invalid token response');
        }

        await setToken({
            rowKey: 'AccessToken',
            value: tokenResponse['access_token'],
            expiresAt: new Date(
                Date.now() + seconds(Number(tokenResponse['expires_in']))
            ).toISOString()
        });

        await setToken({
            rowKey: 'RefreshToken',
            value: tokenResponse['refresh_token'],
            expiresAt: new Date(Date.now() + days(1)).toISOString()
        });
    }

    return {
        getToken,
        setToken,
        setTokens,
        setState,
        validateState
    };
}
