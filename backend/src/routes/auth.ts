import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { register, login, getProfile, updateProfile, updatePassword } from '../controllers/auth';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/password', updatePassword);

export default router;