import { Router, Response } from 'express';
import { queryAll, execute } from '../db';
import { authenticate, AuthenticatedRequest, requireSuperAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/stats', authenticate, requireSuperAdmin, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const users = await queryAll('SELECT COUNT(*) as count FROM users');
  const coaches = await queryAll(`SELECT COUNT(*) as count FROM user_roles WHERE role = 'coach'`);
  const clients = await queryAll(`SELECT COUNT(*) as count FROM user_roles WHERE role = 'client'`);
  res.json({ totalUsers: users[0]?.count || 0, totalCoaches: coaches[0]?.count || 0, totalClients: clients[0]?.count || 0 });
}));

router.get('/users', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const users = await queryAll(`SELECT u.id, u.email, u.is_active, u.email_verified, u.created_at, u.last_login_at, p.full_name, STRING_AGG(ur.role, ',') as roles FROM users u JOIN profiles p ON u.id = p.user_id LEFT JOIN user_roles ur ON u.id = ur.user_id GROUP BY u.id, u.email, u.is_active, u.email_verified, u.created_at, u.last_login_at, p.full_name ORDER BY u.created_at DESC`);
  res.json(users);
}));

router.put('/users/:id/status', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { is_active } = req.body;
  await execute('UPDATE users SET is_active = @isActive WHERE id = @id', { id: req.params.id, isActive: is_active ? 1 : 0 });
  res.json({ message: 'User status updated' });
}));

export default router;
