// src/command-executors/command-executor.factory.ts
import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { CommandExecutor } from './command-executor.interface';
import { GasCommandExecutor } from './gas-command-executor';
import { GameActivityCommandExecutor } from './game-activity-command-executor';
import { DexActivityCommandExecutor } from './dex-activity-executor';

@Injectable()
export class CommandExecutorFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  createExecutor(commandName: string): CommandExecutor {
    switch (commandName) {
      case 'manipulate-gas-price':
        return this.moduleRef.get(GasCommandExecutor, { strict: false },);
      case 'game-activity':
        return this.moduleRef.get(GameActivityCommandExecutor, { strict: false });
      case 'generate-dex-activity':
        return this.moduleRef.get(DexActivityCommandExecutor, { strict: false });
      default:
        throw new Error(`No executor found for command: ${commandName}`);
    }
  }
}
