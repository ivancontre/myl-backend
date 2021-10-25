import { JwtPayload, sign, verify } from 'jsonwebtoken';

export const generateJWT = (id: string, name: string): Promise<string | undefined> => {

    return new Promise((resolve, reject) => {

        const payload = {
            id,
            name
        };

        sign(payload, process.env.SECRET_JWT_SEED as string, {
            expiresIn: '24h'
        }, (error, token) => {
            
            if (error) {
                console.log(error);
                reject('No se pudo generar el token');
            }

            resolve(token);
        });
        
    });
};

export const checkJWT = (token: string) => {
    try {

        const payload: JwtPayload = verify(token, process.env.SECRET_JWT_SEED as string) as JwtPayload;
        
        // console.log(payload)
        const { id } = payload;

        return [true, id];
        
    } catch (error) {
        return [false, null];
    }
}

