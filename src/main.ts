import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { init } from './infrastructure/database/migrations';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [{
        hostname: process.env.BUS_HOST,
        username: process.env.BUS_USER,
        password: process.env.BUS_PASS,
        port: +process.env.BUS_PORT,
      }],
      queue: process.env.BUS_QUEUE,
      queueOptions: {
        durable: false
      },
      prefetchCount: 1,
    },
  });

  // validate DB
  await init();

  // load DB pool
  await import('./infrastructure/database');

  app.startAllMicroservices();
  await app.listen({ host: process.env.HOST, port: +process.env.PORT });
}
bootstrap();
