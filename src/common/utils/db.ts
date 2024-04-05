import mysql from 'mysql';
import config from './config';
import util from 'util';
import { LOG } from './logger';
import { Klass, deserialize } from '@/models/base';

const pool = mysql.createPool({
  ...config.db,
  typeCast: (field, useDefaultTypeCasting) => {
    // We only want to cast bit fields that have a single-bit in them. If the field
    // has more than one bit, then we cannot assume it is supposed to be a Boolean.
    if (field.type === 'BIT' && field.length === 1) {
      const bytes = field.buffer();

      // A Buffer in Node represents a collection of 8-bit unsigned integers.
      // Therefore, our single "bit field" comes back as the bits '0000 0001',
      // which is equivalent to the number 1.

      return bytes === null ? 0 : bytes[0] === 1;
    }

    return useDefaultTypeCasting();
  },
});
const getConn = util.promisify(pool.getConnection).bind(pool);
const query = util.promisify(pool.query).bind(pool);

pool.on('acquire', function (connection: { threadId: any }) {
  LOG.info('DB Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection: { threadId: any }) {
  LOG.info('DB Connection %d released', connection.threadId);
});

// this has to be any
type T = { [k: string]: any };

/**
 * Getting & releasing connection is automatic.
 * This function only work is execute statements and coerce type on result.
 * @param stmt: sql statement
 * @param queryFn: Query function
 */
const run = async <T>(
  stmt: string,
  queryFn?: (stmt: string) => Promise<unknown>,
): Promise<T> => {
  let q = queryFn;
  if (!queryFn) {
    q = query;
  }
  return (await q!(stmt)) as Promise<T>;
};

/**
 * Query wrapper boilerplate for SELECT queries expecting 1 record in response
 * @param stmt: sql statement
 * @param klass: class to which response will be casted to
 */
const get = async <K>(stmt: string, klass: Klass): Promise<K | null> => {
  try {
    const rows = await run<T[]>(stmt);
    if (rows.length > 0) {
      // instantiate object of class K
      return new klass(deserialize(rows[0])) as K;
    }
  } catch (e) {
    LOG.info({ error: e });
  }
  return null;
};

/**
 * query wrapper boilerplate for SELECT queries expecting multiple records in response
 * @param stmt: sql statement
 * @param klass: class to which response will be casted to
 */
const all = async <K>(stmt: string, klass: Klass): Promise<K[] | null> => {
  try {
    const rows = await run<T[]>(stmt);
    if (rows.length > 0) {
      // instantiate object of class K
      return rows.map((row) => {
        return new klass(deserialize(row)) as K;
      });
    }
  } catch (e) {
    LOG.info({ error: e });
  }
  return null;
};

/**
 * query wrapper boilerplate for UPDATE/INSERT queries expecting nothing in response
 * @param stmt: sql statement
 */
const update = async (stmt: string) => {
  try {
    await run(stmt);
  } catch (e) {
    LOG.info({ error: e });
  }
  return null;
};

/**
 * Handle sequential INSERT/UPDATE statements in a transaction
 * @param stmts: list of mysql statements
 */
const updateTxn = async (stmts: string[]) => {
  let done = false;
  const conn = await getConn();
  const beginTxn = util.promisify(conn.beginTransaction).bind(conn);
  const rollback = util.promisify(conn.rollback).bind(conn);
  const commit = util.promisify(conn.commit).bind(conn);
  const _query = util.promisify(conn.query).bind(conn);
  await beginTxn();
  try {
    for (const stmt of stmts) {
      await run(stmt, _query);
    }
    await commit();
    done = true;
  } catch (e) {
    LOG.info({
      message: 'db transaction failed, rolling back',
      stmts,
      error: e,
    });
    await rollback();
  } finally {
    conn.release();
  }
  return done;
};

/**
 * Handle sequential INSERT/UPDATE statements in a transaction
 * @param updateStmts: list of INSERT/UPDATE statements
 * @param readStmt: single mysql statement to be fired before committing the transaction, this is returned
 * @param klass: type cast query result of getStmt
 */
const updateAndGetTxn = async <K>(
  updateStmts: string[],
  readStmt: string,
  klass: Klass,
): Promise<K | null> => {
  // type T = z.infer<typeof klass.schema>;
  let result: K | null = null;
  const conn = await getConn();
  const beginTxn = util.promisify(conn.beginTransaction).bind(conn);
  const rollback = util.promisify(conn.rollback).bind(conn);
  const commit = util.promisify(conn.commit).bind(conn);
  const connQuery = util.promisify(conn.query).bind(conn);
  await beginTxn();
  try {
    for (const stmt of updateStmts) {
      await run(stmt, connQuery);
    }
    const rows = (await connQuery(readStmt)) as T[];
    if (rows.length > 0) {
      // instantiate object of class K
      result = new klass(rows[0]) as K;
    }
    await commit();
  } catch (e) {
    LOG.info({
      message: 'db transaction failed, rolling back',
      updateStmts,
      getStmt: readStmt,
      error: e,
    });
    await rollback();
  } finally {
    conn.release();
  }
  return result;
};

export const DB = { get, all, update, updateTxn, updateAndGetTxn };
