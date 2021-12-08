import { Request, Response} from 'express';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

import nodemailer from 'nodemailer';

import { IUser, UserModel } from '../models';
import { checkJWT, generateJWT } from '../helpers';
import { transporter } from '../helpers/mailer';

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

        if (!user.verify) {
            return res.status(401).json({
                msg: `El usuario aún no verifica su correo para activar la cuenta`,
                openModalForVerifyAccount: true,
                email: user.email
            });
        }

        // Verficar passwords
        const validPassword = compareSync(password, user.password);

        if (!validPassword) {
            return res.status(400).json({
                msg: `Usuario y contraseña no son correctos`
            });
        }

        if (user.online) {
            return res.status(401).json({
                msg: `Ya se encuentra con una sesión activa en algún dispositivo. Cierre la sesión en él y vuelva a intentarlo`
            });
        }

        // Generar JWT
        const token = await generateJWT(user.id, user.username);

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

        if (process.env.STATUS_REGISTER === 'false') {
            return res.status(401).json({
                msg: `El usuario se registró correctamente, pero no se encuentra activo. Hable con el administrador`
            });
        }

        const token = await generateJWT(user.id, user.username, '1h');

        await transporter.verify();

        await transporter.sendMail({
            from: '"No responder" <foo@example.com>', // sender address
            to: email, // list of receivers
            subject: "Verificación de cuenta MyL App", // Subject line
            html: `Hola ${user.name} para verificar tu cuenta presiona <a href="${process.env.CORS_ORIGIN}/auth/verify/${token}">aquí </a>`
        });

        return res.status(201).json({});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }   

};

export const retryVerify = async (req: Request, res: Response) => {
    
    const { email } = req.body;

    try {

        const user = await UserModel.findOne({ email });

        const token = await generateJWT(user?.id, user?.username as string, '1h');

        await transporter.verify();

        await transporter.sendMail({
            from: '"No responder" <foo@example.com>', // sender address
            to: email, // list of receivers
            subject: "Verificación de cuenta MyL App", // Subject line
            html: `Hola ${user?.name} para verificar tu cuenta presiona <a href="${process.env.CORS_ORIGIN}/auth/verify/${token}">aquí </a>`
        });
        
        return res.json({});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'No fue posible renovar el token'
        });
    }  
};

export const recoveryPassword = async (req: Request, res: Response) => {

    const { email } = req.body;

    try {

        const tempPassword = Math.random().toString(36).slice(-6);
        const salt: string = genSaltSync();
        const hashPassword = hashSync(tempPassword, salt);

        const userExists = await UserModel.findOne({ email });        

        await transporter.verify();

        await transporter.sendMail({
            from: '"No responder" <foo@example.com>', // sender address
            to: email, // list of receivers
            subject: "Recuperar contraseña MyL App", // Subject line
            text: `Hola ${userExists?.name}, tu nueva contraseña es: ${tempPassword}`, // plain text body
        });

        await UserModel.findByIdAndUpdate(userExists?.id, { password: hashPassword }, { new: true });
        
        return res.json({});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};

export const renewToken = async (req: Request, res: Response) => {

    const { id, username } = req.user;

    try {
        // Generar nuestro JWT
        const token = await generateJWT(id, username);
        
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

export const detail = async (req: Request, res: Response) => {

    try {
        
        const user = await UserModel.findById(req.user._id);

        if (user) {
            return res.json({
                playing: user.playing,
                victories: user.victories,
                defeats: user.defeats
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};

export const updateUser = async (req: Request, res: Response) => {

    const { name, lastname, password, password2 } = req.body;
    
    try {
        
        const user = await UserModel.findById(req.user._id);

        const validPassword = compareSync(password, user?.password as string);

        if (!validPassword) {
            return res.status(400).json({
                msg: `Contraseña incorrecta`
            });
        }

        if (password2) {

            const salt: string = genSaltSync();

            const hashPassword = hashSync(password2, salt);

            await UserModel.findByIdAndUpdate(user?.id, { name, lastname, password: hashPassword }, { new: true });

        } else {

            await UserModel.findByIdAndUpdate(user?.id, { name, lastname }, { new: true });

        }

        return res.json({
            name,
            lastname
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};

export const okToken = async (req: Request, res: Response) => {

    try {

        const token = req.header('x-token');

        const [valid, id] = checkJWT(token as string);

        if (!valid) {
            return res.status(401).json({
                msg: 'Token inválido'
            });
        }

        const user = await UserModel.findById(id);

        await UserModel.findByIdAndUpdate(id, { verify: true }, { new: true });

        const newToken = await generateJWT(id, user?.username as string);
        
        return res.json({
            token: newToken,
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Por favor hable con el administrador'
        });
    }

};
