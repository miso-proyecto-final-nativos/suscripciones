import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT ? Number(process.env.PORT) : 4070;
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: port,
    },
  });
  app.startAllMicroservices();
  await app.listen(3070);
  console.info('Microservice suscripciones listening on port:', port);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
}
bootstrap();
