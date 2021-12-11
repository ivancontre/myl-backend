import { Router } from 'express';
import { check } from 'express-validator';
import { patchBooloeansUser } from '../controllers';
import { existsUser } from '../helpers';
import { fieldsValidator, verifyJWT } from '../middlewares';

const router: Router = Router();

router.patch(
    '/user-boolenas/:id',
    verifyJWT,
    [
        check('id', 'El ID no es válido').isMongoId(),
        check('id').custom(existsUser),
        check('status').optional().isBoolean(),
        check('verify').optional().isBoolean(),
        check('online').optional().isBoolean(),
        check('playing').optional().isBoolean(),
        fieldsValidator
    ],
    patchBooloeansUser
);

export default router;