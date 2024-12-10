import { networkIDs } from '@avalabs/avalanchejs';
import { addTxSignatures } from '@avalabs/avalanchejs';
import { utils } from '@avalabs/avalanchejs';
import { Context } from '@avalabs/avalanchejs';
import { pvm } from '@avalabs/avalanchejs';
import { config } from 'dotenv';

config();

const pvmapi = new pvm.PVMApi(process.env.AVAX_PUBLIC_URL);
const P_CHAIN_ADDRESS = process.env.P_CHAIN_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NODE_ID = process.env.NODE_ID;
console.log(process.env.AVAX_PUBLIC_URL, P_CHAIN_ADDRESS, PRIVATE_KEY);

const main = async () => {
  if (!P_CHAIN_ADDRESS || !PRIVATE_KEY) {
    throw new Error('Missing environment variable(s).');
  }
  

  let { utxos } = await pvmapi.getUTXOs({ addresses: [P_CHAIN_ADDRESS] });
  if (utxos.length > 0) {
    utxos = utxos.slice(1);
  }
  const context = await Context.getContextFromURI(process.env.AVAX_PUBLIC_URL);
  const startTime = await new pvm.PVMApi().getTimestamp();
  const startDate = new Date(startTime.timestamp);
  const start = BigInt(startDate.getTime() / 1000);
  const endTime = new Date(startTime.timestamp);
  endTime.setDate(endTime.getDate() + 2);
  const end = BigInt(endTime.getTime() / 1000);
  const nodeID = NODE_ID;
  const amount = BigInt(1e17);
  console.log('Arguments:');
  console.log('context:', context);
  console.log('utxos:', utxos);
  console.log('P_CHAIN_ADDRESS:', P_CHAIN_ADDRESS);
  console.log('nodeID:', nodeID);
  console.log('networkID:', networkIDs.PrimaryNetworkID.toString());
  console.log('start:', start);
  console.log('end:', end);
  console.log('stake amount:', amount);
  console.log('privateKey:', PRIVATE_KEY);

  // const balance = await pvmapi.getBalance(P_CHAIN_ADDRESS);
  // console.log('Current balance:', balance.balance);

  
  const tx = pvm.newAddPermissionlessDelegatorTx(
    context,
    utxos,
    [utils.bech32ToBytes(P_CHAIN_ADDRESS)],
    nodeID,
    networkIDs.PrimaryNetworkID.toString(),
    start,
    end,
    amount,
    [utils.bech32ToBytes(P_CHAIN_ADDRESS)],
  );

  await addTxSignatures({
    unsignedTx: tx,
    privateKeys: [utils.hexToBuffer(PRIVATE_KEY)],
  });

  return pvmapi.issueSignedTx(tx.getSignedTx());
};

main().then(console.log);
