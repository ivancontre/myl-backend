import { OAuth2Client, TokenPayload } from 'google-auth-library';

export const googleVerify = async (idToken: string): Promise<TokenPayload | undefined> => {
    
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    return payload;
    
}