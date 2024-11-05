import { UrlEntity } from "../entities";
import { DataSource } from "typeorm";

export const urlRepository = [
    {
        provide: 'URL_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(UrlEntity),
        inject: ['DATA_SOURCE'],
    }
];