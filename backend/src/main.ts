import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS para el frontend (Admite dominios dinámicos generados por Vercel)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Prefijo global de API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 GasDesk API corriendo en: http://localhost:${port}/api`);
}
bootstrap();
