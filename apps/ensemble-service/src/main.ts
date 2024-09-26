import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); 
  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));
  app.useGlobalGuards(new JwtAuthGuard());

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
