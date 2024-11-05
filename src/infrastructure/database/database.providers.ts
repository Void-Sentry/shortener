
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'cockroachdb',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USER,
        database: process.env.DB_NAME,
        ssl: {
          ca: '',
          cert: '',
          key: '',
          rejectUnauthorized: true,
        },
        entities: [
          __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
        timeTravelQueries: false,
      });

      return dataSource.initialize();
    },
  },
];
