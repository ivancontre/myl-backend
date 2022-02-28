import { Router } from 'express';
import { getEra, getEraAvailable } from '../controllers';
import { verifyJWT } from '../middlewares';

const router: Router = Router();

router.get(
    '/', 
    verifyJWT,
    getEra
);

router.get(
    '/available', 
    getEraAvailable
);

export default router;