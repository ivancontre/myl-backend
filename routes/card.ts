import { Router } from 'express';
import { check, body } from 'express-validator';
import multer from 'multer';
let cacheService = require("express-api-cache");
let cache = cacheService.cache;
import { postCard, getCard, getCardById, updateCard, getCardsByEdition, deleteCard, patchCard } from '../controllers';
import { isValidFrecuency, isValidRace, isValidType, isValidEdition, existsCard, isValidEra } from '../helpers';
import { fieldsValidator, hasRole, verifyJWT } from '../middlewares';

const upload = multer();


const router: Router = Router();

router.post(
    '/', 
    verifyJWT, 
    hasRole('ADMIN_ROLE'),
    upload.single('files[]'),
    [
        //body('num', 'El campo "num" es obligatorio').optional().isNumeric(),
        //body('num').custom(existsCardNumber),
        check('name', 'El campo "name" es obligatorio').not().isEmpty(),
        check('type', 'El ID tipo no es válido').isMongoId(),
        check('type').custom(isValidType),
        check('frecuency', 'El ID frecuencia no es válido').isMongoId(),
        check('frecuency').custom(isValidFrecuency),
        //check('race', 'El ID raza no es válido').optional().isMongoId(),
        check('race').optional().custom(isValidRace),
        check('edition', 'El ID edición no es válido').isMongoId(),
        check('edition').custom(isValidEdition),
        check('era', 'El ID era no es válido').isMongoId(),
        check('era').custom(isValidEra),
        //check('cost').optional().isNumeric(),
        //check('strength').optional().isNumeric(),
        check('isMachinery').optional().isBoolean(),
        check('isUnique').optional().isBoolean(),
        fieldsValidator
    ],
    postCard
);

router.get(
    '/',
    verifyJWT,
    hasRole('ADMIN_ROLE'),
    getCard
)

router.get(
    '/:id',
    verifyJWT,
    hasRole('ADMIN_ROLE'),
    [
        check('id', 'El ID no es válido').isMongoId(),
        check('id').custom(existsCard),
        fieldsValidator
    ],
    getCardById
)

router.put(
    '/:id',
    verifyJWT,
    hasRole('ADMIN_ROLE'),
    [
        check('id', 'El ID no es válido').isMongoId(),
        check('id').custom(existsCard),
        fieldsValidator
    ],
    upload.single('files[]'),
    updateCard
)

router.patch(
    '/',
    verifyJWT,
    hasRole('ADMIN_ROLE'),
    upload.single('files[]'),
    patchCard
)

router.delete(
    '/:id',
    verifyJWT,
    hasRole('ADMIN_ROLE'),
    [
        check('id', 'El ID no es válido').isMongoId(),
        check('id').custom(existsCard),
        fieldsValidator
    ],
    deleteCard
)

router.get(
    '/:id/edition',
    verifyJWT,

    cache("10 minutes"),
    [
        check('id', 'El ID no es válido').isMongoId(),
        check('id').custom(isValidEdition),
        fieldsValidator
    ],
    getCardsByEdition
)


export default router;