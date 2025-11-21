import phrases from './phrases.json';
import type { Credentials } from 'graph-interface/lib/src/interfaces';

export default {
    phrases,
    schedule: process.env.SCHEDULE || '0 0 8 * * *',
    sendRandomPhrase: (process.env.SEND_RANDOM_PHRASE || 'true') === 'true',
    email: {
        subject: process.env.EMAIL_SUBJECT || 'Tenha um excelentíssimo dia!',
        to: String(process.env.EMAIL_TO || '')
            .split(',')
            .map(email => email.trim())
    },
    authentication: {
        storageAccountName: process.env.STORAGE_ACCOUNT_NAME || '',
        storageAccountServicePrincipalAuthentication:
            process.env.STORAGE_ACCOUNT_SP_AUTH === 'true',
        tableName: process.env.TABLE_NAME || 'EmailAuthentication',
        callbackUrl:
            (String(process.env.WEBSITE_HOSTNAME).includes('localhost')
                ? 'http'
                : 'https') + `://${process.env.WEBSITE_HOSTNAME}/api/callback`,
        credentials: {
            clientId: process.env.CLIENT_ID || '',
            clientSecret: process.env.CLIENT_SECRET || '',
            tenantId: process.env.TENANT_ID || ''
        } as Credentials,
        scopes: ['https://graph.microsoft.com/.default', 'offline_access']
    },
    gifs: {
        alternativeProbability:
            Number(process.env.ALTERNATIVE_GIF_PROBABILITY) || 1 / 10,
        sources: {
            default:
                'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHB0aWt4dTFnaGtwcnIzNzN1amdyb2wwaXl3Z2UzemhhYzQ0dDZ6ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KcW0iKgbONHUxzWrIF/giphy.gif',
            alternatives: [
                'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGlpeW55cnhyamhzbHk5Nm9iMHI3dmcyZ282OHVyczA2bmlkb2RiayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gflzte2SEjFWHIDZij/giphy.gif',
                'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGZvNWVvbjl6dnNxdTV2OXB2Mm92MDk0NjZheWk4bDZrbzZuNWxvMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/joYf3Ba2phD15ch9Nt/giphy.gif'
            ]
        }
    }
} as const;
