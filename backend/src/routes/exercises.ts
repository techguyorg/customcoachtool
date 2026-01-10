import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute } from '../db';
import { authenticate, optionalAuth, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { asyncHandler, NotFoundError, BadRequestError, ForbiddenError } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/exercises:
 *   get:
 *     tags: [Exercises]
 *     summary: Get all exercises
 *     parameters:
 *       - in: query
 *         name: muscle
 *         schema: { type: string }
 *       - in: query
 *         name: equipment
 *         schema: { type: string }
 *       - in: query
 *         name: difficulty
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of exercises }
 */
router.get('/', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { muscle, equipment, difficulty, search, type } = req.query;

  let whereClause = 'WHERE (is_system = 1';
  const params: Record<string, unknown> = {};

  // Include user's custom exercises if authenticated
  if (req.user) {
    whereClause += ' OR created_by = @userId';
    params.userId = req.user.id;
  }
  whereClause += ')';

  if (muscle) {
    whereClause += ' AND primary_muscle = @muscle';
    params.muscle = muscle;
  }
  if (equipment) {
    whereClause += ' AND equipment = @equipment';
    params.equipment = equipment;
  }
  if (difficulty) {
    whereClause += ' AND difficulty = @difficulty';
    params.difficulty = difficulty;
  }
  if (type) {
    whereClause += ' AND exercise_type = @type';
    params.type = type;
  }
  if (search) {
    whereClause += ' AND (name LIKE @search OR description LIKE @search)';
    params.search = `%${search}%`;
  }

  const exercises = await queryAll<Record<string, unknown>>(
    `SELECT id, name, description, instructions, tips, common_mistakes,
            primary_muscle, secondary_muscles, equipment, difficulty,
            exercise_type, video_url, image_url, is_system, created_by, created_at
     FROM exercises ${whereClause}
     ORDER BY name`,
    params
  );

  res.json(exercises);
}));

/**
 * @swagger
 * /api/exercises/{id}:
 *   get:
 *     tags: [Exercises]
 *     summary: Get exercise by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Exercise details }
 *       404: { description: Exercise not found }
 */
router.get('/:id', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const exercise = await queryOne<Record<string, unknown>>(
    `SELECT id, name, description, instructions, tips, common_mistakes,
            primary_muscle, secondary_muscles, equipment, difficulty,
            exercise_type, video_url, image_url, is_system, created_by, created_at
     FROM exercises WHERE id = @id`,
    { id }
  );

  if (!exercise) {
    throw NotFoundError('Exercise');
  }

  // Check access for non-system exercises
  if (!exercise.is_system && exercise.created_by !== req.user?.id) {
    throw ForbiddenError('You do not have access to this exercise');
  }

  // Get alternatives
  const alternatives = await queryAll<{ id: string; name: string }>(
    `SELECT e.id, e.name 
     FROM exercises e
     JOIN exercise_alternatives ea ON e.id = ea.alternative_exercise_id
     WHERE ea.exercise_id = @id`,
    { id }
  );

  res.json({ ...exercise, alternatives });
}));

/**
 * @swagger
 * /api/exercises:
 *   post:
 *     tags: [Exercises]
 *     summary: Create a new exercise
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exercise'
 *     responses:
 *       201: { description: Exercise created }
 *       401: { description: Unauthorized }
 */
router.post('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    description,
    instructions,
    tips,
    common_mistakes,
    primary_muscle,
    secondary_muscles,
    equipment,
    difficulty = 'intermediate',
    exercise_type = 'strength',
    video_url,
    image_url,
  } = req.body;

  if (!name || !primary_muscle || !equipment) {
    throw BadRequestError('Name, primary muscle, and equipment are required');
  }

  const id = uuidv4();

  await execute(
    `INSERT INTO exercises (id, name, description, instructions, tips, common_mistakes,
                           primary_muscle, secondary_muscles, equipment, difficulty,
                           exercise_type, video_url, image_url, is_system, created_by)
     VALUES (@id, @name, @description, @instructions, @tips, @commonMistakes,
             @primaryMuscle, @secondaryMuscles, @equipment, @difficulty,
             @exerciseType, @videoUrl, @imageUrl, 0, @createdBy)`,
    {
      id,
      name,
      description,
      instructions: JSON.stringify(instructions || []),
      tips: JSON.stringify(tips || []),
      commonMistakes: JSON.stringify(common_mistakes || []),
      primaryMuscle: primary_muscle,
      secondaryMuscles: JSON.stringify(secondary_muscles || []),
      equipment,
      difficulty,
      exerciseType: exercise_type,
      videoUrl: video_url,
      imageUrl: image_url,
      createdBy: req.user!.id,
    }
  );

  const exercise = await queryOne(
    'SELECT * FROM exercises WHERE id = @id',
    { id }
  );

  res.status(201).json(exercise);
}));

/**
 * @swagger
 * /api/exercises/{id}:
 *   put:
 *     tags: [Exercises]
 *     summary: Update an exercise
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exercise'
 *     responses:
 *       200: { description: Exercise updated }
 *       403: { description: Cannot modify system exercises }
 *       404: { description: Exercise not found }
 */
router.put('/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const existing = await queryOne<{ is_system: boolean; created_by: string }>(
    'SELECT is_system, created_by FROM exercises WHERE id = @id',
    { id }
  );

  if (!existing) {
    throw NotFoundError('Exercise');
  }

  // Only super_admin can edit system exercises
  const isSuperAdmin = req.user!.roles.includes('super_admin');
  if (existing.is_system && !isSuperAdmin) {
    throw ForbiddenError('Cannot modify system exercises');
  }

  // Only creator or super_admin can edit custom exercises
  if (!existing.is_system && existing.created_by !== req.user!.id && !isSuperAdmin) {
    throw ForbiddenError('You can only modify your own exercises');
  }

  const {
    name,
    description,
    instructions,
    tips,
    common_mistakes,
    primary_muscle,
    secondary_muscles,
    equipment,
    difficulty,
    exercise_type,
    video_url,
    image_url,
  } = req.body;

  await execute(
    `UPDATE exercises SET 
       name = COALESCE(@name, name),
       description = COALESCE(@description, description),
       instructions = COALESCE(@instructions, instructions),
       tips = COALESCE(@tips, tips),
       common_mistakes = COALESCE(@commonMistakes, common_mistakes),
       primary_muscle = COALESCE(@primaryMuscle, primary_muscle),
       secondary_muscles = COALESCE(@secondaryMuscles, secondary_muscles),
       equipment = COALESCE(@equipment, equipment),
       difficulty = COALESCE(@difficulty, difficulty),
       exercise_type = COALESCE(@exerciseType, exercise_type),
       video_url = COALESCE(@videoUrl, video_url),
       image_url = COALESCE(@imageUrl, image_url),
       updated_at = GETUTCDATE()
     WHERE id = @id`,
    {
      id,
      name,
      description,
      instructions: instructions ? JSON.stringify(instructions) : null,
      tips: tips ? JSON.stringify(tips) : null,
      commonMistakes: common_mistakes ? JSON.stringify(common_mistakes) : null,
      primaryMuscle: primary_muscle,
      secondaryMuscles: secondary_muscles ? JSON.stringify(secondary_muscles) : null,
      equipment,
      difficulty,
      exerciseType: exercise_type,
      videoUrl: video_url,
      imageUrl: image_url,
    }
  );

  const exercise = await queryOne('SELECT * FROM exercises WHERE id = @id', { id });
  res.json(exercise);
}));

/**
 * @swagger
 * /api/exercises/{id}:
 *   delete:
 *     tags: [Exercises]
 *     summary: Delete an exercise
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Exercise deleted }
 *       403: { description: Cannot delete system exercises }
 */
router.delete('/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const existing = await queryOne<{ is_system: boolean; created_by: string }>(
    'SELECT is_system, created_by FROM exercises WHERE id = @id',
    { id }
  );

  if (!existing) {
    throw NotFoundError('Exercise');
  }

  const isSuperAdmin = req.user!.roles.includes('super_admin');
  
  if (existing.is_system && !isSuperAdmin) {
    throw ForbiddenError('Cannot delete system exercises');
  }

  if (!existing.is_system && existing.created_by !== req.user!.id && !isSuperAdmin) {
    throw ForbiddenError('You can only delete your own exercises');
  }

  await execute('DELETE FROM exercises WHERE id = @id', { id });

  res.json({ message: 'Exercise deleted' });
}));

export default router;
