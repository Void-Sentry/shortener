import { repositories } from './infrastructure/database/repositories';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ShortController } from './application/short.controller';
import { ShortService } from './application/short.service';
import { Module } from '@nestjs/common';
import { models } from './domain';

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
  controllers: [ShortController],
  providers: [
    ShortService,
    ...repositories,
    ...models,
  ],
})
export class AppModule {}
