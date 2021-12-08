import { Router } from 'express';
import { check } from 'express-validator';
import { login, register, renewToken, detail, recoveryPassword, updateUser, okToken, retryVerify } from '../controllers';
import { fieldsValidator } from '../middlewares';

import { existsEmail, isValidRole, existsUserByName, notExistsEmail } from '../helpers';
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

router.post(
    '/recovery-password',
    [
        check('email', 'El campo "email" es obligatorio').isEmail(),
        check('email').custom(notExistsEmail),
        fieldsValidator
    ],
    recoveryPassword
);

router.post(
    '/recovery-password',
    [
        check('email', 'El campo "email" es obligatorio').isEmail(),
        check('email').custom(notExistsEmail),
        fieldsValidator
    ],
    recoveryPassword
);

router.put(
    '/update', 
    verifyJWT,
    [
        check('name', 'El campo "name" es obligatorio').not().isEmpty(),
        check('lastname', 'El campo "lastname" es obligatorio').not().isEmpty(),
        check('password', 'El campo "password" debe de ser al menos de 6 caracteres').isLength({ min: 6 }),
        check('password2', 'El campo "password" debe de ser al menos de 6 caracteres').optional().isLength({ min: 6 }),
        fieldsValidator
    ],
    updateUser
);

router.get(
    '/renew-token', 
    verifyJWT,
    renewToken
);

router.get(
    '/detail', 
    verifyJWT,
    detail
);

router.get(
    '/verify-token',
    okToken
);

router.post(
    '/retry-verify',
    [
        check('email', 'El campo "email" es obligatorio').isEmail(),
        check('email').custom(notExistsEmail),
        fieldsValidator
    ],
    retryVerify
);

export default router;