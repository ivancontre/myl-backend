import { Router } from 'express';
import { check } from 'express-validator';
import { deleteDeck, getDecks, patchDeck, postDeck, updateDeck } from '../controllers';
import { existsDeck, validCardsDeck } from '../helpers';
import { fieldsValidator, verifyJWT } from '../middlewares';

const router: Router = Router();

router.post(
    '/', 
    verifyJWT, 
    [

        check('name', 'El campo "name" es obligatorio').not().isEmpty(),
        check('cards', 'El campo "name" es obligatorio').isArray(),
        check('cards').custom(validCardsDeck),
        check('era').optional().isString(),
        fieldsValidator
    ],
    postDeck
);

router.get(
    '/',
    verifyJWT,
    getDecks
)

router.delete(
    '/:id',
    verifyJWT,
    [
        check('id', 'El ID no es válido').isMongoId(),
        check('id').custom(existsDeck),
        fieldsValidator
    ],
    deleteDeck
);

router.put(
    '/:id',
    verifyJWT,
    [
        check('id', 'El ID no es válido').isMongoId(),
        check('id').custom(existsDeck),
        check('cards').optional().custom(validCardsDeck),
        check('era').optional().isString(),
        fieldsValidator
    ],
    updateDeck
);

router.patch(
    '/:id',
    verifyJWT,
    [
        check('id', 'El ID no es válido').isMongoId(),
        check('id').custom(existsDeck),
        fieldsValidator
    ],
    patchDeck
)


export default router;