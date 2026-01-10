import { Router, Response } from 'express';
import { queryOne, queryAll, execute } from '../db';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/profile', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await queryOne(
    `SELECT p.*, cp.fitness_level, cp.fitness_goals, cp.current_weight_kg, cp.target_weight_kg, cp.height_cm, cp.dietary_restrictions
     FROM profiles p
     LEFT JOIN client_profiles cp ON p.user_id = cp.user_id
     WHERE p.user_id = @userId`,
    { userId: req.user!.id }
  );
  res.json(profile);
}));

router.put('/profile', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { full_name, bio, phone, date_of_birth, gender, avatar_url } = req.body;
  await execute(
    `UPDATE profiles SET full_name = COALESCE(@fullName, full_name), bio = COALESCE(@bio, bio), phone = COALESCE(@phone, phone), date_of_birth = COALESCE(@dateOfBirth, date_of_birth), gender = COALESCE(@gender, gender), avatar_url = COALESCE(@avatarUrl, avatar_url), updated_at = GETUTCDATE() WHERE user_id = @userId`,
    { userId: req.user!.id, fullName: full_name, bio, phone, dateOfBirth: date_of_birth, gender, avatarUrl: avatar_url }
  );
  const profile = await queryOne('SELECT * FROM profiles WHERE user_id = @userId', { userId: req.user!.id });
  res.json(profile);
}));

export default router;
