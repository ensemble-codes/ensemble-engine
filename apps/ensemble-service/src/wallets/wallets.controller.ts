import { Controller, Post, Request, Param, Get, NotFoundException, ForbiddenException } from '@nestjs/common';
import { WalletsService } from 'libs/shared/src/wallets/wallets.service';
import { Wallet } from 'libs/shared/src/wallets/schemas/wallet.schema';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@Request() req) {
    return this.walletsService.create(req.user.userId);
  }

  @Post(':address')
  insert(@Request() req, @Param('address') address: string) {
    return this.walletsService.insert(req.user.userId, address);
  }

  @Get(':address')
  async findOne(@Request() req, @Param('address') id: string): Promise<Wallet> {
    const wallet = await this.walletsService.findOne(id);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    if (wallet.owner?.toString() !== req.user.userId) {
      console.warn(`You are not authorized to access this wallet. wallet.owner: ${typeof wallet.owner}, user.id: ${typeof req.user.userId}`)
      throw new ForbiddenException('You are not authorized to access this wallet');
    }
    return wallet;
  }

  @Get()
  async findWalletsByOwner(@Request() req): Promise<Wallet[]> {
    return this.walletsService.findWalletsByOwner(req.user.userId);
  }
    
    // if (!wallet) {
    //   throw new NotFoundException('Wallet not found');
    // }
    // if (wallet.owner?.toString() !== req.user.userId) {
    //   console.warn(`You are not authorized to access this wallet. wallet.owner: ${typeof wallet.owner}, user.id: ${typeof req.user.userId}`)
    //   throw new ForbiddenException('You are not authorized to access this wallet');
    // }
    // return wallet;
  // }

  @Get('group/:groupId')
  findAllByGroupId(@Param('groupId') groupId: string): Promise<Wallet[]> {
    return this.walletsService.getWalletsByGroup(groupId);
  }

  @Get('group')
  findAllGroups(): Promise<string[]> {
    return this.walletsService.getAllGroupIds();
  }
}
