import { Router } from 'express';
import { check } from 'express-validator';
import { login, register, renewToken } from '../controllers';
import { fieldsValidator } from '../middlewares';

import { existsEmail, existsUser, isValidRole, existsUserByName } from '../helpers';
import { verifyJWT } from '../middlewares/verifyJWT';

const router: Router = Router();

router.post(
    '/login',
    [
        check('username', 'El nombre de usuario es obligatorio').not().isEmpty(),
        check('password', 'El password debe de ser de 6 caracteres').isLength({ min: 6 }),
        fieldsValidator
    ],
    login
);

router.post(
    '/register',
    [
        check('name', 'El campo "name" es obligatorio').not().isEmpty(),
        check('lastname', 'El campo "lastname" es obligatorio').not().isEmpty(),
        check('email', 'El campo "email" es obligatorio').isEmail(),
        check('email').custom(existsEmail),
        check('username', 'El campo "username" es obligatorio').custom(existsUserByName),
        check('username', 'El campo "username" no debe tener un largo mayor a 15 caracteres').isLength({ max: 15 }),
        check('password', 'El campo "password" debe de ser al menos de 6 caracteres').isLength({ min: 6 }),
        check('role').optional().custom(isValidRole),
        fieldsValidator
    ],
    register
);

router.get(
    '/renew-token', 
    verifyJWT,
    renewToken
);

export default router;