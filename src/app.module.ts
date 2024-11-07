import { repositories } from './infrastructure/database/repositories';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ShortController } from './application/short.controller';
import { ClickHandler } from './application/click.handler';
import { ShortService } from './application/short.service';
import { UrlHandler } from './application/url.handler';
import { Module } from '@nestjs/common';
import { models } from './domain';
import { CacheService } from './infrastructure/cache/cache.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REDIRECTOR_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [{
            hostname: process.env.BUS_HOST,
            username: process.env.BUS_USER,
            password: process.env.BUS_PASS,
            port: +process.env.BUS_PORT,
          }],
          queue: 'redirector_queue',
          queueOptions: {
            durable: false
          },
          prefetchCount: 1,
        },
      }
    ]),
  ],
  controllers: [ShortController, ClickHandler, UrlHandler],
  providers: [
    ShortService,
    CacheService,
    ...repositories,
    ...models,
  ],
})
export class AppModule {}
