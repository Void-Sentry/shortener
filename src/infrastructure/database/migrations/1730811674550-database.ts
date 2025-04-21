import { TDbClient } from '../db.service';

export default {
    up: async (client: TDbClient, dbName: string) => {
      // const dbName = process.env.DB_NAME;
      const res = await client.query(`SELECT datname FROM pg_database WHERE datname = $1`, [dbName]);

      if (res.rowCount !== 0) {
        await client.release();
        throw new Error('DATABASE ALREADY EXISTS!');
      }

      await client.query(`CREATE DATABASE ${dbName}`);
    },
    down: async (client: TDbClient, dbName: string) => {
      // const dbName = process.env.DB_NAME;
      await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
    },
  };
