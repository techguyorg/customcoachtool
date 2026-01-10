import { Router, Response } from 'express';
import { queryAll, execute } from '../db';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notifications = await queryAll('SELECT * FROM notifications WHERE user_id = @userId ORDER BY created_at DESC', { userId: req.user!.id });
  res.json(notifications);
}));

router.put('/:id/read', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await execute('UPDATE notifications SET is_read = 1, read_at = GETUTCDATE() WHERE id = @id AND user_id = @userId', { id: req.params.id, userId: req.user!.id });
  res.json({ message: 'Marked as read' });
}));

router.put('/read-all', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await execute('UPDATE notifications SET is_read = 1, read_at = GETUTCDATE() WHERE user_id = @userId AND is_read = 0', { userId: req.user!.id });
  res.json({ message: 'All marked as read' });
}));

export default router;
