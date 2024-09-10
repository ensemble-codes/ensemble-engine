import { Network } from "./entities"


const FUSE = {
  name: 'fuse',
  chainId: 122
}

const OP_SEPOLIA = {
  name: 'op_sepolia',
  chainId: 11155420
}

const BASE_SEPOLIA = {
  name: 'base_sepolia',
  chainId: 84532
}

const SEPOLIA = {
  name: 'sepolia',
  chainId: 11155111
}

const map = {
  fuse: FUSE,
  op_sepolia: OP_SEPOLIA,
  base_sepolia: BASE_SEPOLIA,
  sepolia: SEPOLIA
}

export const getNetwork = (networkName: string): Network  => map[networkName]