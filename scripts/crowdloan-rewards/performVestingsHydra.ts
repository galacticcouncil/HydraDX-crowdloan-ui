const vestingsHydra = require("../data/hdx-vesting-hydra-crowdloan.json");
import { log, performVestingCall } from './common/performVestings';

function main() {
  performVestingCall(vestingsHydra);
}

try {
  log('Performing batch vesting call for Snek crowdloaners');

  main();
} catch(e) {
  console.log(e)
  process.exit()
}
