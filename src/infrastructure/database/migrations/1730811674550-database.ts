import { TDbClient } from '../index';

export default {
    up: async (client: TDbClient) => {
      const dbName = process.env.DB_NAME;
      const res = await client.query(`SELECT datname FROM pg_database WHERE datname = $1`, [dbName]);

      if (res.rowCount !== 0) {
        await client.release();
        throw new Error('DATABASE ALREADY EXISTS!');
      }

      await client.query(`CREATE DATABASE ${dbName}`);
      await client.release();
    },
    down: async (client: TDbClient) => {
      const dbName = process.env.DB_NAME;
      await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
    },
  };
