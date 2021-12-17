import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices'

const env = require('dotenv').config().parsed

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [env.RABBIT_MQ],
      queue: 'payment_queue',
      queueOptions: {
        durable: false
      },
    },
  });
  await app.listen().then(() => console.log('microservice is listening'));
}
bootstrap();
