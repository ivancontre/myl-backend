import { sign } from 'jsonwebtoken';

export const generateJWT = (id: string, name: string): Promise<string | undefined> => {

    return new Promise((resolve, reject) => {

        const payload = {
            id,
            name
        };

        sign(payload, process.env.SECRET_JWT_SEED as string, {
            expiresIn: '2h'
        }, (error, token) => {
            
            if (error) {
                console.log(error);
                reject('No se pudo generar el token');
            }

            resolve(token);
        });
        
    });
};