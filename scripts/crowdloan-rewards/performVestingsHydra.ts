const BN = require("bn.js");
const vestingsHydra = require("../data/hdx-vesting-hydra-crowdloan.json");
const totalRewardsHydra = require("../data/hdx-total-rewards-hydra-crowdloan.json");
import { log, performVestingCall } from './common/performVestings';

async function main() {
  let totalRewards = new BN(totalRewardsHydra.total_rewards);
  await performVestingCall(vestingsHydra, totalRewards);
}

main()
  .catch(e => {
    log(e);
    process.exit(1);
  });
