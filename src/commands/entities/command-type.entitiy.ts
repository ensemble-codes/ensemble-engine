// src/commands/config/commands.config.ts

export interface CommandType {
  name: string;
  description: string;
  template?: Object;
}

export const COMMAND_TYPES: CommandType[] = [
  {
    name: 'loadtest',
    description: 'Run a network load test',
  },
  {
    name: 'manipulate-gas-price',
    description: 'Keeps the gas price in the specified range',
    template: ['gas_price()','$max_gas_price'],
  },
  {
    name: 'maintain-balance',
    description: 'Maintain account balances in a certain range',
    // template: [{'balance_of()': ['$contract_address', '$token_address']} ,'$min_balance','$max_balance'],
    template: [{'in_range()': [{'balance_of()': ['$contract_address', '$token_address']}, '$min_balance', '$max_balance'], 'target:': '$target_address'}],
  },
  {
    name: 'generate-game-activity',
    description: 'Generate game activity',
    template: [[{'volume_of()':['$contract_address', '$token_address']},'$min_volume'],
      [{'number_of_players()': '$contract_address'}, '$min_players']],
  },
  {
    name: 'generate-dex-activity',
    description: 'Generate game activity',
    template: [[{'volume_of()':['$contract_address', '$first_token_address', '$second_token_address']},'$min_volume']],
  },
];
