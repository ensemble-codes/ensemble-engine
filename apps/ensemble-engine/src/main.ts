import { NestFactory } from '@nestjs/core';
import { EngineAppModule } from './ensemble-engine.module';

async function bootstrap() {
  console.log('Starting Ensemble Engine...');
  const app = await NestFactory.createApplicationContext(EngineAppModule);
}

bootstrap();
