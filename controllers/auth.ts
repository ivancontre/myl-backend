import { Request, Response} from 'express';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

import { IUser, UserModel } from '../models';
import { generateJWT } from '../helpers';

export const login = async (req: Request, res: Response) => {

    try {

        const { username, password } = req.body;

        const user = await UserModel.findOne({ username });

        // Verficar correo existe
        if (!user) {
            return res.status(400).json({
                msg: `Usuario y contraseña no son correctos`
            });
        }

        // Verficar status
        if (!user.status) {
            return res.status(400).json({
                msg: `Usuario y contraseña no son correcto`
            });
        }

        // Verficar passwords
        const validPassword = compareSync(password, user.password);

        if (!validPassword) {
            return res.status(400).json({
                msg: `Usuario y contraseña no son correctos`
            });
        }

        // Generar JWT
        const token = await generateJWT(user.id, user.name);

        return res.status(200).json({
            user,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }
};

export const register = async (req: Request, res: Response) => {

    try {

        const { name, lastname, email, username, password, role } = req.body;

        const user: IUser = new UserModel({
            name,
            lastname,
            email,
            username,
            password,
            role
        });

        // Encriptar password
        const salt: string = genSaltSync();
        user.password = hashSync(password, salt);

        await user.save();

        const token = await generateJWT(user.id, user.name);

        return res.status(201).json({
            user,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }   

};

export const renewToken = async (req: Request, res: Response) => {

    const {id, name} = req.user;

    try {
        // Generar nuestro JWT
        const token = await generateJWT(id, name);
        
        return res.json({
            token,
            user: req.user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'No fue posible renovar el token'
        });
    }    
};