const vestingsSnek = require("../data/hdx-vesting-snek-crowdloan.json");
import { log, performVestingCall } from './common/performVestings';

function main() {
  performVestingCall(vestingsSnek);
}

try {
  log('Performing batch vesting call for Snek crowdloaners');

  main();
} catch(e) {
  console.log(e)
  process.exit()
}
