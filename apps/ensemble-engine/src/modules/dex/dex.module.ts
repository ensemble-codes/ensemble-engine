import { Module } from '@nestjs/common';
import { DexService } from './dex.service';
import { BlockchainProviderModule } from '../../blockchain-provider/blockchain-provider.module';

@Module({
  imports: [BlockchainProviderModule],
  providers: [DexService],
  exports: [DexService]
})
export class DexModule {}
