import { NextFunction, Request, Response} from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { UserModel } from '../models';

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {

    // x-token viene en el header

    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }

    try {
        
        const payload: JwtPayload = verify(token, process.env.SECRET_JWT_SEED as string) as JwtPayload;
        
        // console.log(payload)
        const { id } = payload;

        const userAuthtenticated = await UserModel.findById(id);

        if (!userAuthtenticated) {
            return res.status(401).json({
                msg: 'Token inválido - user not exists'
            });
        }

        // Verificar si el status esta en true
        if (!userAuthtenticated!.status) {
            return res.status(401).json({
                msg: 'Token inválido - user status: false'
            });
        }
        
        // esto se pasará por next a la siguiente funcion
        const user = userAuthtenticated;
        req.user = user;

        next();
        
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            msg: 'Token inválido'
        });
    }

};