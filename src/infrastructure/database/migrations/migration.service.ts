import { ConfigService } from 'src/infrastructure/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { initPool } from '../utils/db-conn-standalone';
import database from './1730811674550-database';
import clicks from './1730811689810-clicks';
import urls from './1730811698388-urls';
import { Pool } from 'pg';

@Injectable()
export class MigrationService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.#init();
  }

  readonly #init = async () => {
    const defaultPool: Pool = initPool(this.configService.get('DB_NAME_DEFAULT'));
    const defaultDb = await defaultPool.connect();
    let client;
  
    try {
      await database.up(defaultDb, this.configService.get('DB_NAME'));
  
      const pool: Pool = initPool(this.configService.get('DB_NAME'));
      client = await pool.connect();
  
      await clicks.up(client);
      await urls.up(client);
    } catch (e) {
      console.log(e.message);
    } finally {
      client.release();
    }
  };

  readonly #revert = async () => {
    const pool: Pool = initPool(this.configService.get('DB_NAME_DEFAULT'));
    let client = await pool.connect();
  
    try {
      await database.down(client, this.configService.get('DB_NAME'));
    } catch (e) {
      console.log(e.message);
    } finally {
      client.release();
    }
  };
}
