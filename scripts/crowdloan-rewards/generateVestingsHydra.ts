// Generates vesting schedules for the HDX rewards for participants in Hydra crowdloan

import BigNumber from "bignumber.js"
import hdxCrowdloanData from '../data/hdx-raw-rewards-hydra-crowdloan.json'
import { RewardsData, generateVestingsAndTransfers } from './common/generateVestings'

type hydraCrowdloanContributions = {
  data: {
    accounts: Array<Contribution>
  }
}

type Contribution = {
  accountId: string,
  contributions: [
    {
      blockHeight: string,
      contributionReward: string,
      balance: string,
      id: string,
    }
  ],
  id: string,
  totalContributed: string,
}


// At or around 11 March 2022, 18.00 (day of onboarding HydraDX parachain)
const startBlock = '9384940';
// At or around 11 January 2024, 18.00 (one day before end of parachain lease)
const endBlock = '19047340';
const triple = false;

function main() {
  let rewardsData: RewardsData[] = normalizeRewardsData();

  generateVestingsAndTransfers(rewardsData, startBlock, endBlock, 'hydra');
}

function normalizeRewardsData(): RewardsData[] {
  const crowdloanContribs = (hdxCrowdloanData as hydraCrowdloanContributions).data.accounts;

  return crowdloanContribs.flatMap(function(contributor) {  
    return {
      address: contributor.accountId,
      totalRewards: contributor.contributions.map(function(contrib) {
        return new BigNumber(contrib.contributionReward)
      }).reduce((sum, current) => sum.plus(current)).toString()
    }
  });
}


try {
  main()

} catch(e) {
  console.log(e)
  process.exit()
}
