import { Request, Response} from 'express';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { TokenPayload } from 'google-auth-library';
import { v4 as uuid } from 'uuid';

import { IUser, UserModel } from '../models';
import { checkJWT, generateJWT, googleVerify, transporter } from '../helpers';

export const login = async (req: Request, res: Response) => {

    try {

        const { username, password } = req.body;

        const user = await UserModel.findOne({ username });

        // Verficar correo existe
        if (!user) {
            return res.status(400).json({
                msg: `Usuario no registrado en la aplicación`
            });
        }

        // Verficar status
        if (!user.status) {
            return res.status(401).json({
                msg: `Su cuenta está inactiva. Por favor hable con el administrador`
            });
        }

        if (!user.verify) {
            return res.status(401).json({
                msg: `El usuario aún no verifica su correo para activar la cuenta`,
                openModalForVerifyAccount: true,
                email: user.email
            });
        }

        if (user.google) {
            return res.status(401).json({
                msg: `Cuenta creada con Google. Inicie sesión con Google`
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

export const google = async (req: Request, res: Response) => {

    try {

        const { tokenId } = req.body;

        const { given_name: name, family_name: lastname, email} = await googleVerify(tokenId) as TokenPayload;

        let user = await UserModel.findOne({ email });

        let emailSplit: string[] = (email as string).split('@');

        let username = emailSplit[0] + '.' + emailSplit[1].split('.')[0];

        // Sino existe lo creamos
        if (!user) {

            const user2 = await UserModel.findOne({'username': {'$regex': `^${username}$`, $options: 'i'}});

            if (user2) {
                username = `user_${uuid()}`;
            }

            user = new UserModel({
                username,
                email,
                name,
                lastname,    
                google: true,
                verify: true,
                password: '-'
            });

            await user.save();

            await transporter.sendMail({
                from: `"No responder MyL App" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER, 
                subject: process.env.STATUS_REGISTER === 'false' ? `Activar nuevo usuario "${user.id}" registrado con Google` : `Nuevo usuario "${user.id}" registrado con Google`,
                text: `Hola admin, se acaba de registrar un nuevo usuario: \n id: ${user.id} \n email: ${user.email} \n username: ${user.username} \n name: ${user.name} \n lastname: ${user.lastname}`
            });

        } else { 
            // Si existe lo actualizamos
            await UserModel.findByIdAndUpdate(user.id, {
                //name,
                //lastname,
                google: true,
                verify: true,
                password: '-'
            }, { new: true });
        }

        // Verficar status
        if (!user.status) {
            return res.status(401).json({
                msg: `Su cuenta está inactiva. Por favor hable con el administrador`
            });
        }

        // Generar JWT
        const token = await generateJWT(user.id, username);

        return res.status(200).json({
            user,
            token
        });        

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: 'Token google inválido'
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

        const token = await generateJWT(user.id, user.username, '1h');

        await transporter.verify();

        await transporter.sendMail({
            from: `"No responder MyL App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verificación de cuenta MyL App",
            html: `Hola ${user.name}, para verificar tu cuenta presiona <a href="${process.env.CORS_ORIGIN}/auth/verify/${token}">aquí </a>`
        });

        await transporter.sendMail({
            from: `"No responder MyL App" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, 
            subject: process.env.STATUS_REGISTER === 'false' ? `Activar nuevo usuario "${user.id}" registrado` : `Nuevo usuario "${user.id}" registrado`,
            text: `Hola admin, se acaba de registrar un nuevo usuario: \n id: ${user.id} \n email: ${user.email} \n username: ${user.username} \n name: ${user.name} \n lastname: ${user.lastname}`
        });

        if (process.env.STATUS_REGISTER === 'false') {            

            return res.status(401).json({
                msg: `El usuario se registró correctamente, pero no se encuentra activo. Hable con el administrador para que lo active`
            });

        }

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

        if (user?.google) {
            return res.status(400).json({
                msg: 'Cuenta creada con Google. Inicie sesión con Google'
            });
        }

        const token = await generateJWT(user?.id, user?.username as string, '1h');

        await transporter.verify();

        await transporter.sendMail({
            from: `"No responder MyL App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verificación de cuenta MyL App",
            text: `Hola ${user?.name}, para verificar tu cuenta presiona <a href="${process.env.CORS_ORIGIN}/auth/verify/${token}">aquí </a>`
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

        const userExists = await UserModel.findOne({ email });    

        if (userExists?.google) {
            return res.status(400).json({
                msg: 'Cuenta creada con Google. Inicie sesión con Google'
            });
        }

        const tempPassword = Math.random().toString(36).slice(-6);
        const salt: string = genSaltSync();
        const hashPassword = hashSync(tempPassword, salt);            

        await transporter.verify();

        await transporter.sendMail({
            from: `"No responder MyL App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Recuperar contraseña MyL App",
            text: `Hola ${userExists?.name}, tu nueva contraseña es: ${tempPassword}`,
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

        const user = await UserModel.findById(id);

        // Verficar status
        if (!user?.status) {
            return res.status(401).json({
                msg: `Su cuenta está inactiva. Por favor hable con el administrador`
            });
        }

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

    const { name, lastname, password, password2, username } = req.body;

    const { id } = req.params;
    
    try {
        
        const user = await UserModel.findById(id);

        if (password) {

            const validPassword = compareSync(password, user?.password as string);

            if (!validPassword) {
                return res.status(400).json({
                    msg: `Contraseña incorrecta`
                });
            }

            if (password2) {

                const salt: string = genSaltSync();

                const hashPassword = hashSync(password2, salt);

                await UserModel.findByIdAndUpdate(id, { name, lastname, password: hashPassword }, { new: true });

            } else {

                await UserModel.findByIdAndUpdate(id, { name, lastname }, { new: true });

            }

            return res.json({
                name,
                lastname,
                username
            });
        }


        const user2 = await UserModel.findOne({'username': {'$regex': `^${username}$`, $options: 'i'}});

        if (!user2) {

            await UserModel.findByIdAndUpdate(id, { username, name, lastname }, { new: true });

            return res.json({
                name,
                lastname,
                username
            });

        } else if (user2.id === id) {

            await UserModel.findByIdAndUpdate(id, { username, name, lastname }, { new: true });

            return res.json({
                name,
                lastname,
                username
            });

        } else {

            return res.status(400).json({
                msg: `Ya existe un usuario con el username "${username}"`
            });

        }        

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
                msg: 'Token inválido. Para solicitar de nuevo la verificación intente iniciar sesión con su usuario y contraseña'
            });
        }

        const user = await UserModel.findById(id);

        // Verficar status
        if (!user?.status) {
            return res.status(401).json({
                msg: `Su cuenta está inactiva. Por favor hable con el administrador`
            });
        }

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