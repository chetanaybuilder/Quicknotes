/**
 * @file db.js
 * @description PostgreSQL database connection pool and query utility.
 */
import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 8,
  idleTimeoutMillis: 30_000,
});

/**
 * Executes a parameterized SQL query.
 * @param {string} text - SQL query string.
 * @param {Array<any>} params - Query parameters.
 * @returns {Promise<import('pg').QueryResult>} Promise resolving to query result.
 */
export const query = (text, params) => pool.query(text, params);
