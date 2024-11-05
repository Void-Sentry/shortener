import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
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
  app.startAllMicroservices();
  await app.listen({ host: '0.0.0.0', port: +process.env.PORT });
}
bootstrap();
