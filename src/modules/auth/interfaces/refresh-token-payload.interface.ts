export interface RefreshTokenPayload {
    sub: string; // user id
    sid: string; // session ID - tells us which login session this refresh token belongs to
    type: 'refresh';
    iat?: number;
    exp?: number;
}