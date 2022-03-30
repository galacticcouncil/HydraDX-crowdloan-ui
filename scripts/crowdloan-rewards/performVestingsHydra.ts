const BN = require("bn.js");
const vestingsHydra = require("../data/hdx-vesting-hydra-crowdloan.json");
const totalRewardsHydra = require("../data/hdx-total-rewards-hydra-crowdloan.json");
import { log, performVestingCall } from './common/performVestings';

function main() {
  let totalRewards = new BN(totalRewardsHydra.total_rewards);
  performVestingCall(vestingsHydra, totalRewards);
}

try {
  log('Performing batch vesting call for Snek crowdloaners');

  main();
} catch(e) {
  console.log(e)
  process.exit()
}
