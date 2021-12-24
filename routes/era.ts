import { Router } from 'express';
import { getEra } from '../controllers';
import { verifyJWT } from '../middlewares';

const router: Router = Router();

router.get(
    '/', 
    verifyJWT,
    getEra
);

export default router;