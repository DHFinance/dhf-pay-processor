import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices'
import {Logger} from "@nestjs/common";

async function bootstrap() {


  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  })

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_MQ],
      queue: 'payment_queue',
      queueOptions: {
        durable: false
      },
    },
  });
  await app.startAllMicroservices().then(() => console.log('microservice is listening'));
}
bootstrap();
