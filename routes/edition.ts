import { Router } from 'express';
import { getEdition } from '../controllers';
import { verifyJWT } from '../middlewares';

const router: Router = Router();

router.get(
    '/', 
    verifyJWT,
    getEdition
);

export default router;