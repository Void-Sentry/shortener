import { ClickEntity } from "../entities";
import { DataSource } from "typeorm";

export const clickRepository = [
    {
        provide: 'CLICK_REPOSITORY',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ClickEntity),
        inject: ['DATA_SOURCE'],
    }
];