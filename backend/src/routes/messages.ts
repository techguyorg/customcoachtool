import { Router, Response } from 'express';
import { queryAll, execute } from '../db';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const messages = await queryAll(`SELECT m.*, p.full_name as sender_name FROM messages m JOIN profiles p ON m.sender_id = p.user_id WHERE m.sender_id = @userId OR m.recipient_id = @userId ORDER BY m.created_at DESC`, { userId: req.user!.id });
  res.json(messages);
}));

router.post('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { recipient_id, content } = req.body;
  const id = uuidv4();
  await execute('INSERT INTO messages (id, sender_id, recipient_id, content) VALUES (@id, @senderId, @recipientId, @content)', { id, senderId: req.user!.id, recipientId: recipient_id, content });
  res.status(201).json({ id, message: 'Message sent' });
}));

export default router;
