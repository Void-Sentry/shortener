import { initPool } from '../utils/db-conn-standalone';
import database from './1730811674550-database';
import clicks from './1730811689810-clicks';
import urls from './1730811698388-urls';
import { Pool } from 'pg';

export const init = async () => {
  const defaultPool: Pool = initPool('postgres');
  const defaultDb = await defaultPool.connect();
  let client;

  try {
    await database.up(defaultDb);

    const pool: Pool = initPool();
    client = await pool.connect();

    await clicks.up(client);
    await urls.up(client);
  } catch (e) {
    console.log(e.message);
    client && client.release();
    client = null;
  } finally {
    client && client.release();
  }
};

export const revert = async () => {
  const pool: Pool = initPool();
  let client = await pool.connect();

  try {
    await database.down(client);
  } catch (e) {
    console.log(e.message);
    client.release();
    client = null;
  } finally {
    if (client)
      client.release();
  }
};
