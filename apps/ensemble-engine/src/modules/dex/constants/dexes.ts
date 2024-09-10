import { DexDefaults } from "../entities";

export const SEPOLIA_UNISWAP: DexDefaults = {
  factoryAddress: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
  routerAddress: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
  universalRouterAddress: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
  name: 'uniswap',
  network: 'sepolia',
}

export const FUSE_VOLTAGE: DexDefaults = {
  factoryAddress: '0xaD079548b3501C5F218c638A02aB18187F62b207',
  routerAddress: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
  name: 'voltage',
  network: 'fuse',
}

export const BASE_SEPOLIA_UNISWAP: DexDefaults = {
  factoryAddress: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
  routerAddress: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4',
  quoterAddress: '0xC5290058841028F1614F3A6F0F5816cAd0df5E27',
  universalRouterAddress: '0x050E797f3625EC8785265e1d9BDd4799b97528A1',
  permit2Address: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  name: 'uniswap',
  network: 'base_sepolia',
}

export const getDexDefaults = (dexName: string, dexNetwork: string): DexDefaults => {
  switch (dexName) {
    case 'uniswap':
      if (dexNetwork === 'sepolia') {
        return SEPOLIA_UNISWAP
      } else if (dexNetwork === 'base_sepolia') {
        return BASE_SEPOLIA_UNISWAP
      }
    case 'voltage':
      return FUSE_VOLTAGE
    default:
      throw new Error('Invalid dex name')
  }
}