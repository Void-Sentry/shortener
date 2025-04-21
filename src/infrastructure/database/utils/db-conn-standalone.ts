import { ConfigService } from 'src/infrastructure/config';
import { readFileSync } from 'fs';
import { Pool } from 'pg';

export const initPool = (config: ConfigService) => (
    new Pool({
        host: config.get('DB_HOST'),
        user: config.get('DB_USER'),
        port: +config.get('DB_PORT'),
        database: config.get('DB_NAME'),
        ssl: {
            rejectUnauthorized: true,
            cert: readFileSync(`/run/secrets/client.${config.get('DB_USER')}.crt`).toString(),
            key: readFileSync(`/run/secrets/client.${config.get('DB_USER')}.key`).toString(),
            ca: readFileSync('/run/secrets/ca.crt').toString(),
        },
    })
);