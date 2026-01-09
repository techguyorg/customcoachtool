import sql from "mssql";

const config: sql.config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER || "sql-ccp-prod.database.windows.net",
  database: process.env.SQL_DATABASE || "sqldb-ccp-prod",
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getDb(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export async function query<T>(
  sqlQuery: string,
  params?: Record<string, any>
): Promise<T[]> {
  const db = await getDb();
  const request = db.request();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }

  const result = await request.query(sqlQuery);
  return result.recordset as T[];
}

export async function queryOne<T>(
  sqlQuery: string,
  params?: Record<string, any>
): Promise<T | null> {
  const results = await query<T>(sqlQuery, params);
  return results.length > 0 ? results[0] : null;
}

export async function execute(
  sqlQuery: string,
  params?: Record<string, any>
): Promise<number> {
  const db = await getDb();
  const request = db.request();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }

  const result = await request.query(sqlQuery);
  return result.rowsAffected[0];
}

export async function executeWithOutput<T>(
  sqlQuery: string,
  params?: Record<string, any>
): Promise<T | null> {
  const db = await getDb();
  const request = db.request();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }

  const result = await request.query(sqlQuery);
  return result.recordset[0] as T || null;
}
