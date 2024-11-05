import { DatabaseModule } from './infrastructure/database/database.module';
import { repositories } from './infrastructure/database/repositories';
import { ShortController } from './application/short.controller';
import { ShortService } from './application/short.service';
import { Module } from '@nestjs/common';
import { models } from './domain';

@Module({
  imports: [DatabaseModule],
  controllers: [ShortController],
  providers: [
    ShortService,
    ...repositories,
    ...models,
  ],
})
export class AppModule {}
