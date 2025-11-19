export default interface TokenEntity {
    rowKey: 'AccessToken' | 'RefreshToken';
    value: string;
    expiresAt: string;
}
