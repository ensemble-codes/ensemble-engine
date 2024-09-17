import { NestFactory } from '@nestjs/core';
import { EngineAppModule } from './ensemble-engine.module';
import 'dotenv/config';

async function bootstrap() {
  console.log('Starting Ensemble Engine...');
  console.log('process.env.MONGODB_URI:', process.env.MONGODB_URI);
  console.log('process.env.PROVIDER_URL_FUSE:', process.env.PROVIDER_URL_FUSE);
  console.log(
    'process.env.PROVIDER_URL_SEPOLIA:',
    process.env.PROVIDER_URL_SEPOLIA,
  );
  console.log(
    'process.env.PROVIDER_URL_BASE_SEPOLIA:',
    process.env.PROVIDER_URL_BASE_SEPOLIA,
  );
  console.log(
    'process.env.PROVIDER_URL_OP_SEPOLIA:',
    process.env.PROVIDER_URL_OP_SEPOLIA,
  );
  const app = await NestFactory.createApplicationContext(EngineAppModule);
}

bootstrap();
