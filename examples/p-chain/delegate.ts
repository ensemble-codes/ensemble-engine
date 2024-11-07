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
console.log(process.env.AVAX_PUBLIC_URL, P_CHAIN_ADDRESS, PRIVATE_KEY);

const main = async () => {
  if (!P_CHAIN_ADDRESS || !PRIVATE_KEY) {
    throw new Error('Missing environment variable(s).');
  }

  const { utxos } = await pvmapi.getUTXOs({ addresses: [P_CHAIN_ADDRESS] });
  const context = await Context.getContextFromURI(process.env.AVAX_PUBLIC_URL);
  const startTime = await new pvm.PVMApi().getTimestamp();
  const startDate = new Date(startTime.timestamp);
  const start = BigInt(startDate.getTime() / 1000);
  const endTime = new Date(startTime.timestamp);
  endTime.setDate(endTime.getDate() + 2);
  const end = BigInt(endTime.getTime() / 1000);
  const nodeID = 'NodeID-3JPvbn4J4TxpUHwe8giH7HK1uzQnNUPYJ';

  const tx = pvm.newAddPermissionlessDelegatorTx(
    context,
    utxos,
    [utils.bech32ToBytes(P_CHAIN_ADDRESS)],
    nodeID,
    networkIDs.PrimaryNetworkID.toString(),
    start,
    end,
    BigInt(1e9),
    [utils.bech32ToBytes(P_CHAIN_ADDRESS)],
  );

  await addTxSignatures({
    unsignedTx: tx,
    privateKeys: [utils.hexToBuffer(PRIVATE_KEY)],
  });

  return pvmapi.issueSignedTx(tx.getSignedTx());
};

main().then(console.log);
