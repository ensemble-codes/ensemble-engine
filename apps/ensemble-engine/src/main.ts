import { NestFactory } from '@nestjs/core';
import { EngineAppModule } from './ensemble-engine.module';
import 'dotenv/config';

async function bootstrap() {
  console.log('Starting Ensemble Engine...');
  console.log('process.env.MONGODB_URI', process.env.MONGODB_URI);
  const app = await NestFactory.createApplicationContext(EngineAppModule);
}

bootstrap();
