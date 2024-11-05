import { initPool } from './utils/db-conn-standalone';
import { PoolClient } from 'pg';

export type TDbClient = PoolClient;

export class DbConn {
  private static readonly pool = initPool();

  static async getClient(): Promise<TDbClient> {
    return await DbConn.pool.connect();
  }

  static async beginTransaction(client: TDbClient): Promise<void> {
    await client.query('BEGIN');
  }

  static async commitTransaction(client: TDbClient): Promise<void> {
    await client.query('COMMIT');
  }

  static async rollbackTransaction(client: TDbClient): Promise<void> {
    await client.query('ROLLBACK');
  }

  static async query(
    query: string,
    values?: any[],
    client?: TDbClient,
  ): Promise<any> {
    const currentClient = client ?? (await this.getClient());
    try {
      return await currentClient.query({
        // rowMode: 'array',
        text: query,
        values,
      });
    } finally {
      if (!client) {
        currentClient.release();
      }
    }
  }
}
