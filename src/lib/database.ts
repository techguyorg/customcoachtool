/**
 * Database Service Abstraction Layer
 * 
 * Provides a unified interface for database operations that works with:
 * - Supabase PostgreSQL (current development)
 * - Azure SQL (future production)
 * 
 * Note: For type-safe operations with Supabase, use the Supabase client directly.
 * This abstraction is primarily for Azure migration compatibility.
 */

import { supabase } from "@/integrations/supabase/client";

export interface QueryOptions {
  select?: string;
  filter?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export interface DatabaseResult<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

/**
 * Generic database service interface
 * For production use, prefer direct Supabase client with typed queries
 */
export interface DatabaseService {
  // Raw query helpers - use with caution
  rawQuery<T>(table: string, options?: QueryOptions): Promise<DatabaseResult<T[]>>;
}

/**
 * Supabase PostgreSQL implementation
 * 
 * IMPORTANT: For most use cases, use the Supabase client directly
 * with proper TypeScript types. This service is primarily for:
 * 1. Dynamic table queries (admin features)
 * 2. Migration compatibility with Azure
 */
class SupabaseDatabaseService implements DatabaseService {
  /**
   * Raw query helper - bypasses TypeScript strict typing
   * Use only when table name is dynamic (e.g., admin features)
   */
  async rawQuery<T>(table: string, options: QueryOptions = {}): Promise<DatabaseResult<T[]>> {
    try {
      // Use 'any' type for dynamic table access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any).from(table).select(options.select || "*");

      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as T[], error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}

// Factory function
export function getDatabaseService(): DatabaseService {
  return new SupabaseDatabaseService();
}

// Export singleton instance
export const databaseService = getDatabaseService();

/**
 * Type-safe database helpers
 * These are the recommended way to interact with the database
 */
export const db = {
  /**
   * Get supabase client for type-safe queries
   * Usage: db.client.from('profiles').select('*')
   */
  client: supabase,
};
