import { Router } from 'express';
import { getType } from '../controllers';
import { verifyJWT } from '../middlewares';

const router: Router = Router();

router.get(
    '/', 
    verifyJWT,
    getType
);

export default router;