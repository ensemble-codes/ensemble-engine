import { Controller, Post, Body } from '@nestjs/common';
import { CommandDto } from 'src/commands-lib/commad.dto';

@Controller('commands')
export class CommandsController {
  // constructor(private readonly executorService: ExecutorService) {}

    
  // @Post('onboard')
  // async executeOnboard(@Body('groupId') groupId: string) {
  //   const commandDto = {
  //     groupId: groupId,
  //     name: 'OnBoard',
  //     description: 'Onboard wallets',
  //     status: 'PENDING',
  //     depositAmount: process.env.DEPOSIT_AMOUNT
  //   }
  //   return this.executorService.executeOnboard(commandDto)
  // }


  // async executeCommand(@Body() commandDto: CommandDto) {
  //   return this.executorService.executeCommand(commandDto)
  // }
}
