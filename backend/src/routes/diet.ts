import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, execute } from '../db';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler, NotFoundError, BadRequestError, ForbiddenError } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/diet/plans:
 *   get:
 *     tags: [Diet]
 *     summary: Get all diet plans
 *     responses:
 *       200: { description: List of diet plans }
 */
router.get('/plans', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { goal, dietary_type, search } = req.query;

  let whereClause = 'WHERE (is_system = 1';
  const params: Record<string, unknown> = {};

  if (req.user) {
    whereClause += ' OR created_by = @userId';
    params.userId = req.user.id;
  }
  whereClause += ')';

  if (goal) {
    whereClause += ' AND goal = @goal';
    params.goal = goal;
  }
  if (dietary_type) {
    whereClause += ' AND dietary_type = @dietaryType';
    params.dietaryType = dietary_type;
  }
  if (search) {
    whereClause += ' AND (name LIKE @search OR description LIKE @search)';
    params.search = `%${search}%`;
  }

  const plans = await queryAll<Record<string, unknown>>(
    `SELECT id, name, description, calories_target, protein_grams, carbs_grams, fat_grams,
            meals_per_day, dietary_type, goal, is_system, is_active, created_by, created_at
     FROM diet_plans ${whereClause}
     ORDER BY name`,
    params
  );

  res.json(plans);
}));

/**
 * @swagger
 * /api/diet/plans/{id}:
 *   get:
 *     tags: [Diet]
 *     summary: Get diet plan with meals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Diet plan with meals }
 *       404: { description: Plan not found }
 */
router.get('/plans/:id', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const plan = await queryOne<Record<string, unknown>>(
    `SELECT id, name, description, calories_target, protein_grams, carbs_grams, fat_grams,
            meals_per_day, dietary_type, goal, notes, is_system, is_active, created_by, created_at
     FROM diet_plans WHERE id = @id`,
    { id }
  );

  if (!plan) {
    throw NotFoundError('Diet plan');
  }

  // Get meals
  const meals = await queryAll<Record<string, unknown>>(
    `SELECT id, meal_number, meal_name, time_suggestion, calories, protein_grams, carbs_grams, fat_grams, notes, food_suggestions
     FROM diet_plan_meals WHERE plan_id = @id
     ORDER BY meal_number`,
    { id }
  );

  // Get food items for each meal
  for (const meal of meals) {
    const items = await queryAll<Record<string, unknown>>(
      `SELECT mfi.id, mfi.quantity, mfi.unit, mfi.notes, mfi.order_index,
              mfi.calculated_calories, mfi.calculated_protein, mfi.calculated_carbs, mfi.calculated_fat,
              mfi.food_id, f.name as food_name, f.calories_per_100g, f.protein_per_100g,
              mfi.recipe_id, r.name as recipe_name, r.calories_per_serving
       FROM meal_food_items mfi
       LEFT JOIN foods f ON mfi.food_id = f.id
       LEFT JOIN recipes r ON mfi.recipe_id = r.id
       WHERE mfi.meal_id = @mealId
       ORDER BY mfi.order_index`,
      { mealId: meal.id }
    );
    (meal as Record<string, unknown>).items = items;
  }

  res.json({ ...plan, meals });
}));

/**
 * @swagger
 * /api/diet/plans:
 *   post:
 *     tags: [Diet]
 *     summary: Create a new diet plan
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Diet plan created }
 */
router.post('/plans', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    description,
    calories_target,
    protein_grams,
    carbs_grams,
    fat_grams,
    meals_per_day = 3,
    dietary_type,
    goal,
    notes,
    meals,
  } = req.body;

  if (!name) {
    throw BadRequestError('Name is required');
  }

  const planId = uuidv4();

  await execute(
    `INSERT INTO diet_plans (id, name, description, calories_target, protein_grams, carbs_grams, fat_grams, meals_per_day, dietary_type, goal, notes, is_system, is_active, created_by)
     VALUES (@id, @name, @description, @caloriesTarget, @proteinGrams, @carbsGrams, @fatGrams, @mealsPerDay, @dietaryType, @goal, @notes, 0, 1, @createdBy)`,
    {
      id: planId,
      name,
      description,
      caloriesTarget: calories_target,
      proteinGrams: protein_grams,
      carbsGrams: carbs_grams,
      fatGrams: fat_grams,
      mealsPerDay: meals_per_day,
      dietaryType: dietary_type,
      goal,
      notes,
      createdBy: req.user!.id,
    }
  );

  // Insert meals
  if (meals && Array.isArray(meals)) {
    for (const meal of meals) {
      const mealId = uuidv4();
      await execute(
        `INSERT INTO diet_plan_meals (id, plan_id, meal_number, meal_name, time_suggestion, calories, protein_grams, carbs_grams, fat_grams, notes, food_suggestions)
         VALUES (@id, @planId, @mealNumber, @mealName, @timeSuggestion, @calories, @proteinGrams, @carbsGrams, @fatGrams, @notes, @foodSuggestions)`,
        {
          id: mealId,
          planId,
          mealNumber: meal.meal_number,
          mealName: meal.meal_name,
          timeSuggestion: meal.time_suggestion,
          calories: meal.calories,
          proteinGrams: meal.protein_grams,
          carbsGrams: meal.carbs_grams,
          fatGrams: meal.fat_grams,
          notes: meal.notes,
          foodSuggestions: JSON.stringify(meal.food_suggestions || []),
        }
      );

      // Insert food items
      if (meal.items && Array.isArray(meal.items)) {
        for (let i = 0; i < meal.items.length; i++) {
          const item = meal.items[i];
          await execute(
            `INSERT INTO meal_food_items (id, meal_id, food_id, recipe_id, quantity, unit, order_index, notes, calculated_calories, calculated_protein, calculated_carbs, calculated_fat)
             VALUES (@id, @mealId, @foodId, @recipeId, @quantity, @unit, @orderIndex, @notes, @calcCal, @calcProtein, @calcCarbs, @calcFat)`,
            {
              id: uuidv4(),
              mealId,
              foodId: item.food_id,
              recipeId: item.recipe_id,
              quantity: item.quantity,
              unit: item.unit || 'g',
              orderIndex: i,
              notes: item.notes,
              calcCal: item.calculated_calories,
              calcProtein: item.calculated_protein,
              calcCarbs: item.calculated_carbs,
              calcFat: item.calculated_fat,
            }
          );
        }
      }
    }
  }

  const plan = await queryOne('SELECT * FROM diet_plans WHERE id = @id', { id: planId });
  res.status(201).json(plan);
}));

/**
 * @swagger
 * /api/diet/plans/{id}:
 *   delete:
 *     tags: [Diet]
 *     summary: Delete a diet plan
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Plan deleted }
 */
router.delete('/plans/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const existing = await queryOne<{ is_system: boolean; created_by: string }>(
    'SELECT is_system, created_by FROM diet_plans WHERE id = @id',
    { id }
  );

  if (!existing) {
    throw NotFoundError('Diet plan');
  }

  const isSuperAdmin = req.user!.roles.includes('super_admin');

  if (existing.is_system && !isSuperAdmin) {
    throw ForbiddenError('Cannot delete system diet plans');
  }

  if (!existing.is_system && existing.created_by !== req.user!.id && !isSuperAdmin) {
    throw ForbiddenError('You can only delete your own diet plans');
  }

  // Delete in order: food items -> meals -> plan
  await execute(
    `DELETE FROM meal_food_items 
     WHERE meal_id IN (SELECT id FROM diet_plan_meals WHERE plan_id = @id)`,
    { id }
  );
  await execute('DELETE FROM diet_plan_meals WHERE plan_id = @id', { id });
  await execute('DELETE FROM diet_plans WHERE id = @id', { id });

  res.json({ message: 'Diet plan deleted' });
}));

/**
 * @swagger
 * /api/diet/assignments:
 *   get:
 *     tags: [Diet]
 *     summary: Get diet plan assignments for current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of assignments }
 */
router.get('/assignments', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const assignments = await queryAll<Record<string, unknown>>(
    `SELECT pa.id, pa.start_date, pa.end_date, pa.status, pa.coach_notes, pa.client_notes,
            pa.diet_plan_id, dp.name as plan_name, dp.calories_target,
            pa.coach_id, p.full_name as coach_name
     FROM plan_assignments pa
     JOIN diet_plans dp ON pa.diet_plan_id = dp.id
     LEFT JOIN profiles p ON pa.coach_id = p.user_id
     WHERE pa.client_id = @userId AND pa.plan_type = 'diet'
     ORDER BY pa.start_date DESC`,
    { userId: req.user!.id }
  );

  res.json(assignments);
}));

export default router;
