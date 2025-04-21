import { repositories } from './infrastructure/database/repositories';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ShortController } from './application/short.controller';
import { ClickHandler } from './application/click.handler';
import { ShortService } from './application/short.service';
import { UrlHandler } from './application/url.handler';
import { Module } from '@nestjs/common';
import { models } from './domain';
import { CacheService } from './infrastructure/cache/cache.service';
import { ConfigModule, ConfigService } from './infrastructure/config';
import { AuthGuard } from './presentation/guards/auth.guard';
import { DbModule } from './infrastructure/database/db.module';

@Module({
  imports: [
    ConfigModule,
    DbModule,
    ClientsModule.registerAsync([
      {
        name: 'REDIRECTOR_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [{
              hostname: config.get('BUS_HOST'),
              username: config.get('BUS_USER'),
              password: config.get('BUS_PASS'),
              port: +config.get('BUS_PORT'),
            }],
            queue: config.get('REDIRECTOR_QUEUE'),
            queueOptions: {
              durable: false
            },
            prefetchCount: 1,
          },
        }),
      }
    ]),
  ],
  controllers: [ShortController, ClickHandler, UrlHandler],
  providers: [
    ShortService,
    CacheService,
    AuthGuard,
    ...repositories,
    ...models,
  ],
})
export class AppModule {}
