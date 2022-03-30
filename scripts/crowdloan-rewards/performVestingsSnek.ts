const BN = require("bn.js");
const vestingsSnek = require("../data/hdx-vesting-snek-crowdloan.json");
const totalRewardsSnek = require("../data/hdx-total-rewards-snek-crowdloan.json");
import { log, performVestingCall } from './common/performVestings';

async function main() {
  let totalRewards = new BN(totalRewardsSnek.total_rewards);
  await performVestingCall(vestingsSnek, totalRewards);
}

main()
  .catch(e => {
    log(e);
    process.exit(1);
  });
