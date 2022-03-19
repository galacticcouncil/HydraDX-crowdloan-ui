// Generates vesting schedules for the HDX rewards for participants in Hydra crowdloan

import BigNumber from "bignumber.js"
import _ from 'lodash'
import hdxCrowdloanData from '../data/hdx-raw-rewards-hydra-crowdloan.json'
import { RewardsData, generateVestingsAndWriteToFs } from './common/generateVestings'

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

  generateVestingsAndWriteToFs(rewardsData, startBlock, endBlock, triple, 'hydra');
}

function normalizeRewardsData(): RewardsData[] {
  const crowdloanContribs = (hdxCrowdloanData as hydraCrowdloanContributions).data.accounts;
  const groupedContributors = _.groupBy(crowdloanContribs, contrib => contrib.accountId);

  let rewardsData: RewardsData[] = []

  _.flatMap(groupedContributors, function(contributors, k) {
    _.flatMap(contributors, function(contributor, k2) {
      let rewards = new BigNumber(0);
      _.flatMap(contributor.contributions, function(contribution) {
        rewards = rewards.plus(new BigNumber(contribution.contributionReward));
      });

      let individualRewardsData: RewardsData = {
        address: k,
        totalRewards: rewards.toString()
      }

      rewardsData.push(individualRewardsData);
    });
  });

  return rewardsData;
}


try {
  main()

} catch(e) {
  console.log(e)
  process.exit()
}
