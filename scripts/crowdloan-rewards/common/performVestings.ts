require("dotenv").config();
const BN = require("bn.js");
const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { encodeAddress, cryptoWaitReady } = require("@polkadot/util-crypto");
const { stringToU8a } = require("@polkadot/util");
const assert = require("assert");

import { DynamicVestingInfo } from './generateVestings'

const ACCOUNT_SECRET = process.env.ACCOUNT_SECRET || "//Alice";
const RPC = process.env.RPC_SERVER || "ws://127.0.0.1:9988";

const hdxAddress = (pubKey) => encodeAddress(pubKey, 63);
const vestingsAccPubKey = stringToU8a("modlpy/vstng".padEnd(32, "\0"));
const VESTINGS_ACCOUNT = hdxAddress(vestingsAccPubKey);

export const log = function(text: String) {
  console.log(text);
}

const chunkify = (a, size) => Array(Math.ceil(a.length / size)).fill(a).map((_, i) => a.slice(i * size, i * size + size));
const filterEventsByName = (name, events) => events.filter(({event: {section, method}}) => name === `${section}.${method}`);
const sendAndWaitFinalization = ({from, tx, printEvents = []}) => new Promise(resolve =>
  tx.signAndSend(from, (receipt) => {
    let {status, events = []} = receipt;
    if (status.isInBlock) {
      log(`included in: ${status.asInBlock.toHex()}`);
      events.filter(({event: {section}}) => printEvents.includes(section))
        .forEach(({ event: { data, method, section } }) =>
          log(`${section}.${method}` + JSON.stringify(data)));
    }
    if (status.isFinalized) {
      log(`Finalized ${status.asFinalized.toHex()}`);
      resolve(receipt);
    }
  })
);


export async function performVestingCall(vestings: DynamicVestingInfo[]): Promise<any> {
  await cryptoWaitReady();
  const provider = new WsProvider(RPC);
  const api = await ApiPromise.create({provider});
  const keyring = new Keyring({type: "sr25519"});
  const sendFrom = keyring.addFromUri(ACCOUNT_SECRET);

  const [chain, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.version(),
  ]);

  log(`connected to ${RPC} (${chain} ${nodeVersion})`);
  log(`rewards account: ${VESTINGS_ACCOUNT}`);

  const vestingSchedules = vestings.map(({destination, schedule}) =>
    api.tx.sudo.sudoAs(VESTINGS_ACCOUNT, api.tx.vesting.vestedTransfer(destination, schedule))
  );

  log(`vestingSchedules generated ${vestingSchedules.length}`);

  const batch = api.tx.utility.batch(vestingSchedules);

  let { maxExtrinsic: weightLimit } = api.consts.system.blockWeights.perClass.normal;
  const { weight } = await batch.paymentInfo(sendFrom);
  log(`Weight of the whole batch: ${weight.toHuman()}`);
  log(`Weight limit: ${weightLimit.toHuman()}`);

  weightLimit = new BN(weightLimit.toString());

  const blocks = weight.div(weightLimit).toNumber() + 1;
  log(`Batch will be split into ${blocks} blocks`);

  const vestingsPerBlock = Math.ceil(vestingSchedules.length / blocks);
  const chunks = chunkify(vestingSchedules, vestingsPerBlock)
    .map(vestings => api.tx.utility.batch(vestings));

  const weights = await Promise.all(
    chunks.map(async chunk => {
      const {weight} = await chunk.paymentInfo(sendFrom);
      assert(weight.lt(weightLimit), `chunk overweight: ${weight}`);
      return weight;
    })
  );

  log(`chunk weight ${weights[0].toHuman()}`);

  if (process.argv[2] === "test") {
    log('run "npm start" to send tx')
    process.exit()
  }
  const startFrom = Number(process.argv[2]) || 0;

  log("sending txs");

  let totalEndowed = new BN(0);

  for (let i = startFrom; i < chunks.length; i++) {
    log(`batch ${i}`);

    const response: any = await sendAndWaitFinalization({
      from: sendFrom,
      tx: chunks[i],
      //printEvents: ["utility", "sudo", "vesting"]
    }).catch(e => {
      log(e);
      process.exit(1);
    });

    const vestingsAdded = filterEventsByName('vesting.VestingScheduleAdded', response.events).length;
    assert.strictEqual(vestingsAdded, chunks[i].args[0].length, 'not all vestings added');
    const balancesEndowed = filterEventsByName('balances.Endowed', response.events)
      .reduce((sum, {event: {data: [_, balance]}}) => sum.add(balance), new BN(0));
    totalEndowed = totalEndowed.add(balancesEndowed);

    log(`total vested ${totalEndowed.toString()}`);
  }

  process.exit(0);
}
