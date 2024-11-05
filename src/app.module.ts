import { DatabaseModule } from './infrastructure/database/database.module';
import { repositories } from './infrastructure/database/repositories';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController],
  providers: [
    AppService,
    ...repositories,
  ],
})
export class AppModule {}
