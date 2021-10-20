import { Router } from 'express';
import { check, body } from 'express-validator';
import multer from 'multer';
import { postCard, getCard, getCardById, updateCard } from '../controllers';
import { isValidFrecuency, isValidRace, isValidType, isValidEdition, existsCardNumber } from '../helpers';
import { fieldsValidator, verifyJWT } from '../middlewares';

const upload = multer();


const router: Router = Router();

router.post(
    '/', 
    verifyJWT, 
    upload.single('files[]'),
    [
        body('num', 'El campo "num" es obligatorio').isNumeric(),
        body('num').custom(existsCardNumber),
        check('name', 'El campo "name" es obligatorio').not().isEmpty(),
        check('type', 'El ID tipo no es válido').isMongoId(),
        check('type').custom(isValidType),
        check('frecuency', 'El ID frecuencia no es válido').isMongoId(),
        check('frecuency').custom(isValidFrecuency),
        check('race', 'El ID raza no es válido').optional().isMongoId(),
        check('race').optional().custom(isValidRace),
        check('edition', 'El ID edición no es válido').isMongoId(),
        check('edition').custom(isValidEdition),
        check('cost').optional().isNumeric(),
        check('strength').optional().isNumeric(),
        check('isMachinery').optional().isBoolean(),
        check('isUnique').optional().isBoolean(),
        fieldsValidator
    ],
    postCard
);

router.get(
    '/',
    verifyJWT,
    getCard
)

router.get(
    '/:id',
    verifyJWT,
    getCardById
)

router.put(
    '/:id',
    verifyJWT,
    upload.single('files[]'),
    updateCard
)

export default router;