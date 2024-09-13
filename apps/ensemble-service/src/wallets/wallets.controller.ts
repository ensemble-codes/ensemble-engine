import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { WalletsService } from 'libs/shared/src/wallets/wallets.service';
import { Wallet } from 'libs/shared/src/wallets/schemas/wallet.schema';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create() {
    return this.walletsService.create();
  }

  @Get(':id')
  findOne(@Param('walletId') id: string): Promise<Wallet> {
    return this.walletsService.findOne(id);
  }
  /**
   * Fetches wallets by a group identifier.
   * @param {string} id - The unique identifier for the wallet group.
   * @returns {Promise<Wallet[]>} Returns an array of wallets associated with the group ID.
   */
  @Get('group/:groupId')
  findAllByGroupId(@Param('groupId') groupId: string): Promise<Wallet[]> {
    return this.walletsService.getWalletsByGroup(groupId);
  }

  @Get('group')
  findAllGroups(): Promise<string[]> {
    return this.walletsService.getAllGroupIds();
  }
}
