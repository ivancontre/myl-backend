import { Router } from 'express';
import { getFrecuency } from '../controllers';
import { verifyJWT } from '../middlewares';

const router: Router = Router();

router.get(
    '/', 
    verifyJWT,
    getFrecuency
);

export default router;