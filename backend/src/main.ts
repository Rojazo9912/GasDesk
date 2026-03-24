import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UserContextInterceptor } from './common/context/user-context.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  // Interceptor de contexto global
  app.useGlobalInterceptors(new UserContextInterceptor());

  // Validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS hiper-dinámico: aprueba todo origen entrante automáticamente
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Prefijo global de API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 GasDesk API corriendo en: Puerto ${port} (0.0.0.0)/api`);
  console.log(`[!] CORS DINAMICO ACTIVADO CORRECTAMENTE EN PRODUCCIÓN [!]`);
}
bootstrap();
