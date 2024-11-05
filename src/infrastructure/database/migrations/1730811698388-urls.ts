import { TDbClient } from '../index';

export default {
  up: (client: TDbClient) =>
    client.query(`
      CREATE TABLE urls (
        id SERIAL PRIMARY KEY,
        short_code VARCHAR(255) NOT NULL,
        original_url TEXT NOT NULL,
        user_id BIGINT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL,
        deleted_at TIMESTAMP NULL
      );
    `),
  down: (client: TDbClient) =>
    client.query(`
      DROP TABLE IF EXISTS urls;
    `),
};
