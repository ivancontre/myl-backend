import { Router } from 'express';
import { check } from 'express-validator';
import multer from 'multer';
import { getDecks, postDeck } from '../controllers';
import { fieldsValidator, verifyJWT } from '../middlewares';

const upload = multer();


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

export default router;