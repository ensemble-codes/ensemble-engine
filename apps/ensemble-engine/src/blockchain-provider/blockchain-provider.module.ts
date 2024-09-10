import { Module } from '@nestjs/common';
import { BlockchainProviderService } from './blockchain-provider.service';
import { AbiModule } from 'apps/ensemble-service/src/abi/abi.module';
import { SignersService } from './signers.service';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [AbiModule, WalletsModule],
  providers: [BlockchainProviderService, SignersService],
  exports: [BlockchainProviderService, SignersService],
})
export class BlockchainProviderModule {}
