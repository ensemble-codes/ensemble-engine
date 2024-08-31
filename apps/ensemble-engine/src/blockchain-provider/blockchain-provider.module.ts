import { Module } from '@nestjs/common';
import { BlockchainProviderService } from './blockchain-provider.service';

@Module({
  providers: [BlockchainProviderService],
  exports: [BlockchainProviderService],
})
export class BlockchainProviderModule {}
