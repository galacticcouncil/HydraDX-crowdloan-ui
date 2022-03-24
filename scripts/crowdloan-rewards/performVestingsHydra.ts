const vestingsHydra = require("../data/hdx-vesting-hydra-crowdloan.json");
const transfersHydra = require("../data/hdx-transfers-hydra-crowdloan.json");
import { log, performVestingCall } from './common/performVestings';

function main() {
  performVestingCall(vestingsHydra, transfersHydra);
}

try {
  log('Performing batch vesting call for Snek crowdloaners');

  main();
} catch(e) {
  console.log(e)
  process.exit()
}
