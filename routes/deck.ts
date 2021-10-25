import { Router } from 'express';
import { check } from 'express-validator';
import { deleteDeck, getDecks, postDeck, updateDeck } from '../controllers';
import { existsDeck } from '../helpers';
import { fieldsValidator, verifyJWT } from '../middlewares';

const router: Router = Router();

router.post(
    '/', 
    verifyJWT, 
    [

        check('name', 'El campo "name" es obligatorio').not().isEmpty(),
        check('cards', 'El campo "name" es obligatorio').isArray(),
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
        fieldsValidator
    ],
    updateDeck
);


export default router;