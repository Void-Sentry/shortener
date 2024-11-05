import { TDbClient } from '../index';

export default {
  up: (client: TDbClient) =>
    client.query(`
      CREATE TABLE clicks (
        id SERIAL PRIMARY KEY,
        user_agent VARCHAR(100) NOT NULL,
        ip_address VARCHAR(46) NOT NULL,
        referrer TEXT NOT NULL,
        country VARCHAR(100),
        url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL,
        deleted_at TIMESTAMP NULL
      );
    `),
  down: (client: TDbClient) =>
    client.query(`
      DROP TABLE IF EXISTS clicks;
    `),
};
