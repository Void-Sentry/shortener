import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { init } from './infrastructure/database/migrations';
import DailyRotateFile from 'winston-daily-rotate-file';
import { createLogger, format, Logger } from 'winston';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const logger: Logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new DailyRotateFile({
      filename: '/shortener/logs/shortener-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useLogger(WinstonModule.createLogger({ instance: logger }));

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

  // swagger
  const options = new DocumentBuilder()
    .setTitle('Url shortener')
    .setDescription('Url shortener')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('short/api', app, document);

  app.startAllMicroservices();
  await app.listen({ host: process.env.HOST, port: +process.env.PORT });
}
bootstrap();
