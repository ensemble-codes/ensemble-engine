
export class DexDefaults {
  name: string;
  factoryAddress: string;
  routerAddress: string;
  quoterAddress?: string;
  universalRouterAddress?: string;
  permit2Address?: string;
  network: string;
}

export class Dex extends DexDefaults {
  chainId: number;
}

export class Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
}

export class DexArguments {
  tokenInAddress: string;
  tokenInAmount: string;
  tokenOutAddress: string;
  dexName: string;
  network?: string;
  receiverAddress: string;
}