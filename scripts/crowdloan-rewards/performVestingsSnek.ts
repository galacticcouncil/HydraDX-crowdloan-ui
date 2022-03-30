const BN = require("bn.js");
const vestingsSnek = require("../data/hdx-vesting-snek-crowdloan.json");
const totalRewardsSnek = require("../data/hdx-total-rewards-snek-crowdloan.json");
import { log, performVestingCall } from './common/performVestings';

function main() {
  let totalRewards = new BN(totalRewardsSnek.total_rewards);
  performVestingCall(vestingsSnek, totalRewards);
}

try {
  log('Performing batch vesting call for Snek crowdloaners');

  main();
} catch(e) {
  console.log(e)
  process.exit()
}
