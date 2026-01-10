import { Router, Response } from 'express';
import { queryAll, execute } from '../db';
import { authenticate, AuthenticatedRequest, requireCoach } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/clients', authenticate, requireCoach, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const clients = await queryAll(
    `SELECT ccr.id as relationship_id, ccr.status, ccr.started_at, p.user_id as client_id, p.full_name, p.email, p.avatar_url,
            cp.fitness_level, cp.current_weight_kg, cp.target_weight_kg
     FROM coach_client_relationships ccr
     JOIN profiles p ON ccr.client_id = p.user_id
     LEFT JOIN client_profiles cp ON ccr.client_id = cp.user_id
     WHERE ccr.coach_id = @coachId AND ccr.status = 'active'
     ORDER BY p.full_name`,
    { coachId: req.user!.id }
  );
  res.json(clients);
}));

router.get('/analytics', authenticate, requireCoach, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const totalClients = await queryAll('SELECT COUNT(*) as count FROM coach_client_relationships WHERE coach_id = @coachId AND status = @status', { coachId: req.user!.id, status: 'active' });
  const pendingCheckins = await queryAll(`SELECT COUNT(*) as count FROM client_checkins cc JOIN coach_client_relationships ccr ON cc.client_id = ccr.client_id WHERE ccr.coach_id = @coachId AND cc.status = 'submitted'`, { coachId: req.user!.id });
  res.json({ totalClients: totalClients[0]?.count || 0, pendingCheckins: pendingCheckins[0]?.count || 0 });
}));

export default router;
