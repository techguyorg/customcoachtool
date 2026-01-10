import { Router, Response } from 'express';
import { queryAll, execute } from '../db';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const checkins = await queryAll('SELECT * FROM client_checkins WHERE client_id = @clientId ORDER BY checkin_date DESC', { clientId: req.user!.id });
  res.json(checkins);
}));

router.post('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { diet_adherence, workout_adherence, energy_level, sleep_quality, mood_rating, stress_level, general_notes, wins, challenges } = req.body;
  const id = uuidv4();
  await execute(`INSERT INTO client_checkins (id, client_id, diet_adherence, workout_adherence, energy_level, sleep_quality, mood_rating, stress_level, general_notes, wins, challenges, status, submitted_at) VALUES (@id, @clientId, @dietAdherence, @workoutAdherence, @energyLevel, @sleepQuality, @moodRating, @stressLevel, @generalNotes, @wins, @challenges, 'submitted', GETUTCDATE())`,
    { id, clientId: req.user!.id, dietAdherence: diet_adherence, workoutAdherence: workout_adherence, energyLevel: energy_level, sleepQuality: sleep_quality, moodRating: mood_rating, stressLevel: stress_level, generalNotes: general_notes, wins, challenges });
  res.status(201).json({ id, message: 'Check-in submitted' });
}));

export default router;
