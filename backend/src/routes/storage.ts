import { Router, Response } from 'express';
import multer from 'multer';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, BadRequestError } from '../middleware/errorHandler';
import { uploadFile, generateSasUrl, generateBlobName } from '../services/storage';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/upload', authenticate, upload.single('file'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) throw BadRequestError('No file provided');
  const blobName = generateBlobName(req.user!.id, req.file.originalname, req.body.folder);
  const url = await uploadFile(blobName, req.file.buffer, req.file.mimetype);
  res.json({ url, blobName });
}));

router.get('/sas-url', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { blobName } = req.query;
  if (!blobName) throw BadRequestError('blobName is required');
  const sasUrl = await generateSasUrl(blobName as string);
  res.json({ sasUrl });
}));

export default router;
