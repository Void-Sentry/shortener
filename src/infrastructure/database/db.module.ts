import { MigrationService } from "./migrations/migration.service";
import { ConfigModule, ConfigService } from "../config";
import { DbService } from "./db.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: DbService,
            useFactory: async (config: ConfigService, migration: MigrationService) => (
                new DbService(config)
            ),
            inject: [MigrationService, ConfigService],
        },
    ],
})
export class DbModule {}