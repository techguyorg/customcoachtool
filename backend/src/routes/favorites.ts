import { Router, Response } from 'express';
import { queryAll, queryOne, execute } from '../db';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const favorites = await queryAll('SELECT * FROM user_favorites WHERE user_id = @userId', { userId: req.user!.id });
  res.json(favorites);
}));

router.post('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { item_type, item_id } = req.body;
  const existing = await queryOne('SELECT id FROM user_favorites WHERE user_id = @userId AND item_type = @itemType AND item_id = @itemId', { userId: req.user!.id, itemType: item_type, itemId: item_id });
  if (existing) { res.json({ message: 'Already favorited' }); return; }
  await execute('INSERT INTO user_favorites (id, user_id, item_type, item_id) VALUES (@id, @userId, @itemType, @itemId)', { id: uuidv4(), userId: req.user!.id, itemType: item_type, itemId: item_id });
  res.status(201).json({ message: 'Added to favorites' });
}));

router.delete('/:itemType/:itemId', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await execute('DELETE FROM user_favorites WHERE user_id = @userId AND item_type = @itemType AND item_id = @itemId', { userId: req.user!.id, itemType: req.params.itemType, itemId: req.params.itemId });
  res.json({ message: 'Removed from favorites' });
}));

export default router;
