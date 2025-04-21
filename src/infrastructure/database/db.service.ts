import { Injectable, OnModuleInit } from '@nestjs/common';
import { initPool } from './utils/db-conn-standalone';
import { PoolClient } from 'pg';
import { ConfigService } from '../config';

export type TDbClient = PoolClient;

@Injectable()
export class DbService {
  private readonly pool = initPool(this.configService);

  constructor(private readonly configService: ConfigService) {}

  async getClient(): Promise<TDbClient> {
    return await this.pool.connect();
  }

  async beginTransaction(client: TDbClient): Promise<void> {
    await client.query('BEGIN');
  }

  async commitTransaction(client: TDbClient): Promise<void> {
    await client.query('COMMIT');
  }

  async rollbackTransaction(client: TDbClient): Promise<void> {
    await client.query('ROLLBACK');
  }

  async query(
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
