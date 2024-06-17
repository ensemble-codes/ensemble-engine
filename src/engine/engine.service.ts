import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { CommandExecutorFactory } from 'src/command-executors/command-executor.factory';
import { CommandsService } from 'src/commands/commands.service';

@Injectable()
export class EngineService {
  constructor(
    private readonly commandsService: CommandsService,
    private readonly commandExecutorFactory: CommandExecutorFactory,
  ) {}

  @Interval(5000)
  async loop() {
    console.log('EngineService loop, fetching active commands:');
    const commands = await this.commandsService.findActive();
    if (commands.length === 0) { 
      console.log('No active commands found');
    }
    for (const command of commands) {
      const executor = this.commandExecutorFactory.createExecutor(command.name);
      await executor.execute(command);
    }
  }
}
