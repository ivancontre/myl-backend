import { NextFunction, Request, Response} from 'express';

export const hasRole = (...roles: string[]) => {

    return (req: Request, res: Response, next: NextFunction) => {

        if (!req.user) {
            return res.status(500).json({
                msg: 'Se quiere verificar el role sin validar el token primero'
            });
        }
        
        const { role } = req.user;

        if (!roles.includes(role)) {
            return res.status(401).json({
                msg: `El servicio requiere uno de estos roles: ${ roles }`
            });
        }

        next();

    }
};