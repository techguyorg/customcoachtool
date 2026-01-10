import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute } from '../db';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, NotFoundError, BadRequestError, ForbiddenError } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/workouts/templates:
 *   get:
 *     tags: [Workouts]
 *     summary: Get all workout templates
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema: { type: string }
 *       - in: query
 *         name: goal
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of workout templates }
 */
router.get('/templates', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { difficulty, goal, search, days_per_week } = req.query;

  let whereClause = 'WHERE (is_system = 1';
  const params: Record<string, unknown> = {};

  if (req.user) {
    whereClause += ' OR created_by = @userId';
    params.userId = req.user.id;
  }
  whereClause += ')';

  if (difficulty) {
    whereClause += ' AND difficulty = @difficulty';
    params.difficulty = difficulty;
  }
  if (goal) {
    whereClause += ' AND goal = @goal';
    params.goal = goal;
  }
  if (days_per_week) {
    whereClause += ' AND days_per_week = @daysPerWeek';
    params.daysPerWeek = parseInt(days_per_week as string);
  }
  if (search) {
    whereClause += ' AND (name LIKE @search OR description LIKE @search)';
    params.search = `%${search}%`;
  }

  const templates = await queryAll<Record<string, unknown>>(
    `SELECT id, name, description, difficulty, duration_weeks, days_per_week,
            goal, category, is_system, created_by, created_at
     FROM workout_templates ${whereClause}
     ORDER BY name`,
    params
  );

  res.json(templates);
}));

/**
 * @swagger
 * /api/workouts/templates/{id}:
 *   get:
 *     tags: [Workouts]
 *     summary: Get workout template with full structure
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Workout template with weeks, days, and exercises }
 *       404: { description: Template not found }
 */
router.get('/templates/:id', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const template = await queryOne<Record<string, unknown>>(
    `SELECT id, name, description, difficulty, duration_weeks, days_per_week,
            goal, category, is_system, created_by, created_at
     FROM workout_templates WHERE id = @id`,
    { id }
  );

  if (!template) {
    throw NotFoundError('Workout template');
  }

  // Get weeks
  const weeks = await queryAll<Record<string, unknown>>(
    `SELECT id, week_number, name, focus, notes
     FROM workout_template_weeks WHERE template_id = @id
     ORDER BY week_number`,
    { id }
  );

  // Get days for each week
  for (const week of weeks) {
    const days = await queryAll<Record<string, unknown>>(
      `SELECT id, day_number, name, notes
       FROM workout_template_days WHERE week_id = @weekId
       ORDER BY day_number`,
      { weekId: week.id }
    );

    // Get exercises for each day
    for (const day of days) {
      const exercises = await queryAll<Record<string, unknown>>(
        `SELECT wte.id, wte.order_index, wte.sets_min, wte.sets_max, 
                wte.reps_min, wte.reps_max, wte.rest_seconds_min, wte.rest_seconds_max,
                wte.notes, wte.custom_exercise_name, wte.exercise_id,
                e.name as exercise_name, e.primary_muscle, e.equipment
         FROM workout_template_exercises wte
         LEFT JOIN exercises e ON wte.exercise_id = e.id
         WHERE wte.day_id = @dayId
         ORDER BY wte.order_index`,
        { dayId: day.id }
      );
      (day as Record<string, unknown>).exercises = exercises;
    }
    (week as Record<string, unknown>).days = days;
  }

  // Get days without weeks (for simple templates)
  const standaloneDays = await queryAll<Record<string, unknown>>(
    `SELECT id, day_number, name, notes
     FROM workout_template_days WHERE template_id = @id AND week_id IS NULL
     ORDER BY day_number`,
    { id }
  );

  for (const day of standaloneDays) {
    const exercises = await queryAll<Record<string, unknown>>(
      `SELECT wte.id, wte.order_index, wte.sets_min, wte.sets_max, 
              wte.reps_min, wte.reps_max, wte.rest_seconds_min, wte.rest_seconds_max,
              wte.notes, wte.custom_exercise_name, wte.exercise_id,
              e.name as exercise_name, e.primary_muscle, e.equipment
       FROM workout_template_exercises wte
       LEFT JOIN exercises e ON wte.exercise_id = e.id
       WHERE wte.day_id = @dayId
       ORDER BY wte.order_index`,
      { dayId: day.id }
    );
    (day as Record<string, unknown>).exercises = exercises;
  }

  res.json({
    ...template,
    weeks,
    days: standaloneDays,
  });
}));

/**
 * @swagger
 * /api/workouts/templates:
 *   post:
 *     tags: [Workouts]
 *     summary: Create a new workout template
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Template created }
 */
router.post('/templates', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    description,
    difficulty = 'intermediate',
    duration_weeks = 1,
    days_per_week = 3,
    goal,
    category,
    weeks,
    days,
  } = req.body;

  if (!name) {
    throw BadRequestError('Name is required');
  }

  const templateId = uuidv4();

  await execute(
    `INSERT INTO workout_templates (id, name, description, difficulty, duration_weeks, days_per_week, goal, category, is_system, created_by)
     VALUES (@id, @name, @description, @difficulty, @durationWeeks, @daysPerWeek, @goal, @category, 0, @createdBy)`,
    {
      id: templateId,
      name,
      description,
      difficulty,
      durationWeeks: duration_weeks,
      daysPerWeek: days_per_week,
      goal,
      category,
      createdBy: req.user!.id,
    }
  );

  // Insert weeks if provided
  if (weeks && Array.isArray(weeks)) {
    for (const week of weeks) {
      const weekId = uuidv4();
      await execute(
        `INSERT INTO workout_template_weeks (id, template_id, week_number, name, focus, notes)
         VALUES (@id, @templateId, @weekNumber, @name, @focus, @notes)`,
        {
          id: weekId,
          templateId,
          weekNumber: week.week_number,
          name: week.name,
          focus: week.focus,
          notes: week.notes,
        }
      );

      // Insert days for this week
      if (week.days && Array.isArray(week.days)) {
        for (const day of week.days) {
          const dayId = uuidv4();
          await execute(
            `INSERT INTO workout_template_days (id, template_id, week_id, day_number, name, notes)
             VALUES (@id, @templateId, @weekId, @dayNumber, @name, @notes)`,
            {
              id: dayId,
              templateId,
              weekId,
              dayNumber: day.day_number,
              name: day.name,
              notes: day.notes,
            }
          );

          // Insert exercises for this day
          if (day.exercises && Array.isArray(day.exercises)) {
            for (let i = 0; i < day.exercises.length; i++) {
              const ex = day.exercises[i];
              await execute(
                `INSERT INTO workout_template_exercises (id, day_id, exercise_id, custom_exercise_name, order_index, sets_min, sets_max, reps_min, reps_max, rest_seconds_min, rest_seconds_max, notes)
                 VALUES (@id, @dayId, @exerciseId, @customName, @orderIndex, @setsMin, @setsMax, @repsMin, @repsMax, @restMin, @restMax, @notes)`,
                {
                  id: uuidv4(),
                  dayId,
                  exerciseId: ex.exercise_id,
                  customName: ex.custom_exercise_name,
                  orderIndex: i,
                  setsMin: ex.sets_min || 3,
                  setsMax: ex.sets_max,
                  repsMin: ex.reps_min || 8,
                  repsMax: ex.reps_max,
                  restMin: ex.rest_seconds_min || 60,
                  restMax: ex.rest_seconds_max,
                  notes: ex.notes,
                }
              );
            }
          }
        }
      }
    }
  }

  // Insert standalone days (for simple templates)
  if (days && Array.isArray(days)) {
    for (const day of days) {
      const dayId = uuidv4();
      await execute(
        `INSERT INTO workout_template_days (id, template_id, day_number, name, notes)
         VALUES (@id, @templateId, @dayNumber, @name, @notes)`,
        {
          id: dayId,
          templateId,
          dayNumber: day.day_number,
          name: day.name,
          notes: day.notes,
        }
      );

      if (day.exercises && Array.isArray(day.exercises)) {
        for (let i = 0; i < day.exercises.length; i++) {
          const ex = day.exercises[i];
          await execute(
            `INSERT INTO workout_template_exercises (id, day_id, exercise_id, custom_exercise_name, order_index, sets_min, sets_max, reps_min, reps_max, rest_seconds_min, rest_seconds_max, notes)
             VALUES (@id, @dayId, @exerciseId, @customName, @orderIndex, @setsMin, @setsMax, @repsMin, @repsMax, @restMin, @restMax, @notes)`,
            {
              id: uuidv4(),
              dayId,
              exerciseId: ex.exercise_id,
              customName: ex.custom_exercise_name,
              orderIndex: i,
              setsMin: ex.sets_min || 3,
              setsMax: ex.sets_max,
              repsMin: ex.reps_min || 8,
              repsMax: ex.reps_max,
              restMin: ex.rest_seconds_min || 60,
              restMax: ex.rest_seconds_max,
              notes: ex.notes,
            }
          );
        }
      }
    }
  }

  const template = await queryOne('SELECT * FROM workout_templates WHERE id = @id', { id: templateId });
  res.status(201).json(template);
}));

/**
 * @swagger
 * /api/workouts/templates/{id}:
 *   delete:
 *     tags: [Workouts]
 *     summary: Delete a workout template
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Template deleted }
 */
router.delete('/templates/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const existing = await queryOne<{ is_system: boolean; created_by: string }>(
    'SELECT is_system, created_by FROM workout_templates WHERE id = @id',
    { id }
  );

  if (!existing) {
    throw NotFoundError('Workout template');
  }

  const isSuperAdmin = req.user!.roles.includes('super_admin');

  if (existing.is_system && !isSuperAdmin) {
    throw ForbiddenError('Cannot delete system templates');
  }

  if (!existing.is_system && existing.created_by !== req.user!.id && !isSuperAdmin) {
    throw ForbiddenError('You can only delete your own templates');
  }

  // Delete in order: exercises -> days -> weeks -> template
  await execute(
    `DELETE FROM workout_template_exercises 
     WHERE day_id IN (SELECT id FROM workout_template_days WHERE template_id = @id)`,
    { id }
  );
  await execute('DELETE FROM workout_template_days WHERE template_id = @id', { id });
  await execute('DELETE FROM workout_template_weeks WHERE template_id = @id', { id });
  await execute('DELETE FROM workout_templates WHERE id = @id', { id });

  res.json({ message: 'Template deleted' });
}));

/**
 * @swagger
 * /api/workouts/logs:
 *   get:
 *     tags: [Workouts]
 *     summary: Get workout logs for current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of workout logs }
 */
router.get('/logs', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { start_date, end_date, limit = 50 } = req.query;

  let whereClause = 'WHERE client_id = @userId';
  const params: Record<string, unknown> = { userId: req.user!.id };

  if (start_date) {
    whereClause += ' AND workout_date >= @startDate';
    params.startDate = start_date;
  }
  if (end_date) {
    whereClause += ' AND workout_date <= @endDate';
    params.endDate = end_date;
  }

  const logs = await queryAll<Record<string, unknown>>(
    `SELECT TOP ${parseInt(limit as string)} 
            wl.id, wl.workout_date, wl.status, wl.started_at, wl.completed_at,
            wl.duration_minutes, wl.notes, wl.perceived_effort, wl.satisfaction_rating,
            wl.template_id, wt.name as template_name
     FROM workout_logs wl
     LEFT JOIN workout_templates wt ON wl.template_id = wt.id
     ${whereClause}
     ORDER BY wl.workout_date DESC`,
    params
  );

  // Get exercises for each log
  for (const log of logs) {
    const exercises = await queryAll<Record<string, unknown>>(
      `SELECT id, exercise_name, exercise_id, sets_completed, set_data, notes
       FROM workout_log_exercises WHERE workout_log_id = @logId
       ORDER BY order_index`,
      { logId: log.id }
    );
    (log as Record<string, unknown>).exercises = exercises;
  }

  res.json(logs);
}));

/**
 * @swagger
 * /api/workouts/logs:
 *   post:
 *     tags: [Workouts]
 *     summary: Create a workout log
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Workout log created }
 */
router.post('/logs', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    template_id,
    template_day_id,
    workout_date,
    status = 'completed',
    started_at,
    completed_at,
    duration_minutes,
    notes,
    perceived_effort,
    satisfaction_rating,
    exercises,
  } = req.body;

  const logId = uuidv4();

  await execute(
    `INSERT INTO workout_logs (id, client_id, template_id, template_day_id, workout_date, status, started_at, completed_at, duration_minutes, notes, perceived_effort, satisfaction_rating)
     VALUES (@id, @clientId, @templateId, @templateDayId, @workoutDate, @status, @startedAt, @completedAt, @durationMinutes, @notes, @perceivedEffort, @satisfactionRating)`,
    {
      id: logId,
      clientId: req.user!.id,
      templateId: template_id,
      templateDayId: template_day_id,
      workoutDate: workout_date || new Date().toISOString().split('T')[0],
      status,
      startedAt: started_at,
      completedAt: completed_at,
      durationMinutes: duration_minutes,
      notes,
      perceivedEffort: perceived_effort,
      satisfactionRating: satisfaction_rating,
    }
  );

  // Insert exercises
  if (exercises && Array.isArray(exercises)) {
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await execute(
        `INSERT INTO workout_log_exercises (id, workout_log_id, exercise_id, exercise_name, order_index, sets_completed, set_data, notes)
         VALUES (@id, @logId, @exerciseId, @exerciseName, @orderIndex, @setsCompleted, @setData, @notes)`,
        {
          id: uuidv4(),
          logId,
          exerciseId: ex.exercise_id,
          exerciseName: ex.exercise_name,
          orderIndex: i,
          setsCompleted: ex.sets_completed || 0,
          setData: JSON.stringify(ex.set_data || []),
          notes: ex.notes,
        }
      );
    }
  }

  const log = await queryOne('SELECT * FROM workout_logs WHERE id = @id', { id: logId });
  res.status(201).json(log);
}));

export default router;
