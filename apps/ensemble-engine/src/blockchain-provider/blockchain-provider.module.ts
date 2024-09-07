import { Module } from '@nestjs/common';
import { BlockchainProviderService } from './blockchain-provider.service';
import { AbiModule } from 'apps/ensemble-service/src/abi/abi.module';

@Module({
  imports: [AbiModule],
  providers: [BlockchainProviderService],
  exports: [BlockchainProviderService],
})
export class BlockchainProviderModule {}
