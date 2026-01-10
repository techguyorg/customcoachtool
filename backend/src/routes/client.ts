import { Router, Response } from 'express';
import { queryAll, queryOne, execute } from '../db';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/measurements', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const measurements = await queryAll('SELECT * FROM client_measurements WHERE client_id = @clientId ORDER BY recorded_at DESC', { clientId: req.user!.id });
  res.json(measurements);
}));

router.post('/measurements', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { weight_kg, body_fat_pct, waist_cm, chest_cm, hips_cm, notes } = req.body;
  const id = uuidv4();
  await execute(`INSERT INTO client_measurements (id, client_id, weight_kg, body_fat_pct, waist_cm, chest_cm, hips_cm, notes) VALUES (@id, @clientId, @weightKg, @bodyFatPct, @waistCm, @chestCm, @hipsCm, @notes)`,
    { id, clientId: req.user!.id, weightKg: weight_kg, bodyFatPct: body_fat_pct, waistCm: waist_cm, chestCm: chest_cm, hipsCm: hips_cm, notes });
  const measurement = await queryOne('SELECT * FROM client_measurements WHERE id = @id', { id });
  res.status(201).json(measurement);
}));

router.get('/goals', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const goals = await queryAll('SELECT * FROM client_goals WHERE client_id = @clientId ORDER BY created_at DESC', { clientId: req.user!.id });
  res.json(goals);
}));

export default router;
