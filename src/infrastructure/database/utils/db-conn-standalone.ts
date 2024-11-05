import { readFileSync } from 'fs';
import { Pool } from 'pg';

export const initPool = (dbname = process.env.DB_NAME) => (
    new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: +process.env.DB_PORT,
        database: dbname,
        ssl: {
            rejectUnauthorized: true,
            cert: readFileSync(`/run/secrets/client.${process.env.DB_USER}.crt`).toString(),
            key: readFileSync(`/run/secrets/client.${process.env.DB_USER}.key`).toString(),
            ca: readFileSync('/run/secrets/ca.crt').toString(),
        },
    })
);