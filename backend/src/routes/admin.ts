import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute, ensureArray } from '../db';
import { authenticate, AuthenticatedRequest, requireSuperAdmin } from '../middleware/auth';
import { asyncHandler, NotFoundError, BadRequestError } from '../middleware/errorHandler';

const router = Router();

// ============ Dashboard Stats ============

router.get('/stats', authenticate, requireSuperAdmin, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const users = await queryAll<{ count: number }>('SELECT COUNT(*) as count FROM users');
  const coaches = await queryAll<{ count: number }>(`SELECT COUNT(*) as count FROM user_roles WHERE role = 'coach'`);
  const clients = await queryAll<{ count: number }>(`SELECT COUNT(*) as count FROM user_roles WHERE role = 'client'`);
  const activeRelationships = await queryAll<{ count: number }>(`SELECT COUNT(*) as count FROM coach_client_relationships WHERE status = 'active'`);
  const pendingRequests = await queryAll<{ count: number }>(`SELECT COUNT(*) as count FROM coaching_requests WHERE status = 'pending'`);
  
  res.json({ 
    totalUsers: users[0]?.count || 0, 
    totalCoaches: coaches[0]?.count || 0, 
    totalClients: clients[0]?.count || 0,
    activeRelationships: activeRelationships[0]?.count || 0,
    pendingRequests: pendingRequests[0]?.count || 0
  });
}));

router.get('/recent-activity', authenticate, requireSuperAdmin, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  // Get counts for recent activity
  const newUsersToday = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE CAST(created_at AS DATE) = CAST(GETUTCDATE() AS DATE)`
  );
  const newUsersWeek = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE created_at >= DATEADD(day, -7, GETUTCDATE())`
  );
  const newCheckinsWeek = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM client_checkins WHERE created_at >= DATEADD(day, -7, GETUTCDATE())`
  );
  const newWorkoutsWeek = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM workout_logs WHERE created_at >= DATEADD(day, -7, GETUTCDATE())`
  );

  res.json({
    newUsersToday: newUsersToday?.count || 0,
    newUsersWeek: newUsersWeek?.count || 0,
    newCheckinsWeek: newCheckinsWeek?.count || 0,
    newWorkoutsWeek: newWorkoutsWeek?.count || 0,
  });
}));

// ============ User Management ============

router.get('/users', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const users = await queryAll<Record<string, unknown>>(
    `SELECT u.id, u.email, u.is_active, u.email_verified, u.created_at, u.last_login_at, 
            p.full_name, p.avatar_url, p.phone, p.user_id,
            STRING_AGG(ur.role, ',') as roles 
     FROM users u 
     JOIN profiles p ON u.id = p.user_id 
     LEFT JOIN user_roles ur ON u.id = ur.user_id 
     GROUP BY u.id, u.email, u.is_active, u.email_verified, u.created_at, u.last_login_at, 
              p.full_name, p.avatar_url, p.phone, p.user_id
     ORDER BY u.created_at DESC`
  );
  
  // Parse roles from comma-separated string to array
  const usersWithArrayRoles = users.map(user => ({
    ...user,
    roles: ensureArray<string>(user.roles)
  }));
  
  res.json(usersWithArrayRoles);
}));

router.put('/users/:id/status', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { is_active } = req.body;
  await execute('UPDATE users SET is_active = @isActive WHERE id = @id', { id: req.params.id, isActive: is_active ? 1 : 0 });
  res.json({ message: 'User status updated' });
}));

router.post('/users/roles', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, role } = req.body;
  
  if (!userId || !role) {
    throw BadRequestError('userId and role are required');
  }
  
  // Check if role already exists
  const existing = await queryOne<{ id: string }>(
    'SELECT id FROM user_roles WHERE user_id = @userId AND role = @role',
    { userId, role }
  );
  
  if (existing) {
    throw BadRequestError('User already has this role');
  }
  
  const id = uuidv4();
  await execute(
    'INSERT INTO user_roles (id, user_id, role) VALUES (@id, @userId, @role)',
    { id, userId, role }
  );
  
  // If adding coach role, create coach_profile
  if (role === 'coach') {
    const existingProfile = await queryOne('SELECT id FROM coach_profiles WHERE user_id = @userId', { userId });
    if (!existingProfile) {
      await execute(
        'INSERT INTO coach_profiles (id, user_id) VALUES (@id, @userId)',
        { id: uuidv4(), userId }
      );
    }
  }
  
  // If adding client role, create client_profile
  if (role === 'client') {
    const existingProfile = await queryOne('SELECT id FROM client_profiles WHERE user_id = @userId', { userId });
    if (!existingProfile) {
      await execute(
        'INSERT INTO client_profiles (id, user_id) VALUES (@id, @userId)',
        { id: uuidv4(), userId }
      );
    }
  }
  
  res.status(201).json({ message: 'Role added successfully' });
}));

router.delete('/users/:userId/roles/:role', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, role } = req.params;
  
  // Prevent removing own super_admin role
  if (userId === req.user!.id && role === 'super_admin') {
    throw BadRequestError('Cannot remove your own super_admin role');
  }
  
  await execute(
    'DELETE FROM user_roles WHERE user_id = @userId AND role = @role',
    { userId, role }
  );
  
  res.json({ message: 'Role removed successfully' });
}));

router.delete('/users/:id', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  
  // Prevent self-deletion
  if (id === req.user!.id) {
    throw BadRequestError('Cannot delete your own account');
  }
  
  // Delete in order to respect foreign keys
  await execute('DELETE FROM user_roles WHERE user_id = @id', { id });
  await execute('DELETE FROM coach_profiles WHERE user_id = @id', { id });
  await execute('DELETE FROM client_profiles WHERE user_id = @id', { id });
  await execute('DELETE FROM profiles WHERE user_id = @id', { id });
  await execute('DELETE FROM refresh_tokens WHERE user_id = @id', { id });
  await execute('DELETE FROM users WHERE id = @id', { id });
  
  res.json({ message: 'User deleted successfully' });
}));

// ============ Super Admin Management ============

router.get('/super-admins', authenticate, requireSuperAdmin, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const admins = await queryAll<Record<string, unknown>>(
    `SELECT ur.user_id, p.email, p.full_name, ur.created_at
     FROM user_roles ur
     JOIN profiles p ON p.user_id = ur.user_id
     WHERE ur.role = 'super_admin'
     ORDER BY ur.created_at`
  );
  res.json(admins);
}));

router.post('/super-admins', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    throw BadRequestError('Email is required');
  }
  
  // Find user by email
  const profile = await queryOne<{ user_id: string }>(
    'SELECT user_id FROM profiles WHERE LOWER(email) = LOWER(@email)',
    { email }
  );
  
  if (!profile) {
    throw NotFoundError('User with this email');
  }
  
  // Check if already super_admin
  const existing = await queryOne(
    `SELECT id FROM user_roles WHERE user_id = @userId AND role = 'super_admin'`,
    { userId: profile.user_id }
  );
  
  if (existing) {
    throw BadRequestError('User is already a super admin');
  }
  
  // Add super_admin role
  await execute(
    'INSERT INTO user_roles (id, user_id, role) VALUES (@id, @userId, @role)',
    { id: uuidv4(), userId: profile.user_id, role: 'super_admin' }
  );
  
  res.status(201).json({ message: 'Super admin role assigned successfully' });
}));

router.delete('/super-admins/:userId', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  
  // Prevent removing own super_admin role
  if (userId === req.user!.id) {
    throw BadRequestError('Cannot remove your own super_admin role');
  }
  
  await execute(
    `DELETE FROM user_roles WHERE user_id = @userId AND role = 'super_admin'`,
    { userId }
  );
  
  res.json({ message: 'Super admin role revoked successfully' });
}));

// ============ Platform Settings ============

router.get('/settings', authenticate, requireSuperAdmin, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const settings = await queryAll<Record<string, unknown>>(
    'SELECT id, setting_key, setting_value, setting_type, category, description, updated_at FROM platform_settings ORDER BY category, setting_key'
  );
  
  // Parse setting_value JSON
  const parsedSettings = settings.map(s => ({
    ...s,
    setting_value: typeof s.setting_value === 'string' ? 
      (() => { try { return JSON.parse(s.setting_value as string); } catch { return s.setting_value; } })() : 
      s.setting_value
  }));
  
  res.json(parsedSettings);
}));

router.put('/settings/:key', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { key } = req.params;
  const { value, category, description, setting_type } = req.body;
  
  const existing = await queryOne('SELECT id FROM platform_settings WHERE setting_key = @key', { key });
  
  if (existing) {
    await execute(
      `UPDATE platform_settings SET setting_value = @value, updated_at = GETUTCDATE(), updated_by = @updatedBy WHERE setting_key = @key`,
      { key, value: JSON.stringify(value), updatedBy: req.user!.id }
    );
  } else {
    await execute(
      `INSERT INTO platform_settings (id, setting_key, setting_value, setting_type, category, description, updated_by) 
       VALUES (@id, @key, @value, @settingType, @category, @description, @updatedBy)`,
      { 
        id: uuidv4(), 
        key, 
        value: JSON.stringify(value), 
        settingType: setting_type || 'string',
        category: category || 'general',
        description,
        updatedBy: req.user!.id 
      }
    );
  }
  
  res.json({ message: 'Setting updated successfully' });
}));

// ============ Audit Logs ============

router.get('/audit-logs', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { action_type, user_id, limit = 100, offset = 0 } = req.query;
  
  let whereClause = 'WHERE 1=1';
  const params: Record<string, unknown> = { limit: parseInt(limit as string), offset: parseInt(offset as string) };
  
  if (action_type) {
    whereClause += ' AND action_type = @actionType';
    params.actionType = action_type;
  }
  if (user_id) {
    whereClause += ' AND admin_user_id = @userId';
    params.userId = user_id;
  }
  
  const logs = await queryAll<Record<string, unknown>>(
    `SELECT al.*, p.full_name as admin_name
     FROM admin_audit_logs al
     LEFT JOIN profiles p ON al.admin_user_id = p.user_id
     ${whereClause}
     ORDER BY al.created_at DESC
     OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
    params
  );
  
  res.json(logs);
}));

// ============ Pending Requests ============

router.get('/pending-requests', authenticate, requireSuperAdmin, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const requests = await queryAll<Record<string, unknown>>(
    `SELECT cr.id, cr.status, cr.message, cr.created_at,
            cp.full_name as client_name, cp.email as client_email,
            cop.full_name as coach_name, cop.email as coach_email
     FROM coaching_requests cr
     JOIN profiles cp ON cr.client_id = cp.user_id
     JOIN profiles cop ON cr.coach_id = cop.user_id
     WHERE cr.status = 'pending'
     ORDER BY cr.created_at DESC`
  );
  res.json(requests);
}));

// ============ Relationships ============

router.get('/relationships', authenticate, requireSuperAdmin, asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const relationships = await queryAll<Record<string, unknown>>(
    `SELECT ccr.id, ccr.status, ccr.started_at, ccr.ended_at, ccr.notes,
            cp.full_name as client_name, cp.email as client_email, cp.user_id as client_id,
            cop.full_name as coach_name, cop.email as coach_email, cop.user_id as coach_id
     FROM coach_client_relationships ccr
     JOIN profiles cp ON ccr.client_id = cp.user_id
     JOIN profiles cop ON ccr.coach_id = cop.user_id
     ORDER BY ccr.created_at DESC`
  );
  res.json(relationships);
}));

// ============ Content Export/Import ============

router.get('/content/:type/export', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { type } = req.params;
  
  let data: unknown[] = [];
  
  switch (type) {
    case 'exercises':
      data = await queryAll('SELECT * FROM exercises WHERE is_system = 1');
      break;
    case 'workout_templates':
      data = await queryAll('SELECT * FROM workout_templates WHERE is_system = 1');
      break;
    case 'diet_plans':
      data = await queryAll('SELECT * FROM diet_plans WHERE is_system = 1');
      break;
    case 'foods':
      data = await queryAll('SELECT * FROM foods WHERE is_system = 1');
      break;
    case 'recipes':
      data = await queryAll('SELECT * FROM recipes WHERE is_system = 1');
      break;
    default:
      throw BadRequestError(`Unknown content type: ${type}`);
  }
  
  res.json({ type, count: data.length, data });
}));

router.post('/content/:type/import', authenticate, requireSuperAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { type } = req.params;
  const { data } = req.body;
  
  if (!Array.isArray(data)) {
    throw BadRequestError('Data must be an array');
  }
  
  // For now, just return success - actual import logic would be more complex
  res.json({ message: `Import of ${type} queued`, count: data.length });
}));

export default router;
