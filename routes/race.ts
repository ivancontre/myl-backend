import { Router } from 'express';
import { getRace } from '../controllers';
import { verifyJWT } from '../middlewares';

const router: Router = Router();

router.get(
    '/', 
    verifyJWT,
    getRace
);

export default router;