import { Module } from '@nestjs/common';
import { BlockchainProviderService } from './blockchain-provider.service';
import { AbiModule } from 'apps/ensemble-service/src/abi/abi.module';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [AbiModule, WalletsModule],
  providers: [BlockchainProviderService],
  exports: [BlockchainProviderService],
})
export class BlockchainProviderModule {}
