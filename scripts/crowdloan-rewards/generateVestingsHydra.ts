// Generates vesting schedules for the HDX rewards for participants in Hydra crowdloan

import BigNumber from "bignumber.js"
import _ from 'lodash'
import hdxCrowdloanData from '../data/hdx-rewards-hydra-crowdloan.json'
import { DynamicVestingInfo, generateVestings, writeToFS } from './common/generateVestings'

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

const crowdloanContribs = (hdxCrowdloanData as hydraCrowdloanContributions).data.accounts;
const groupedContribitors = _.groupBy(crowdloanContribs, contrib => contrib.accountId);

let rewardsPerContributor = {};

_.flatMap(groupedContribitors, function(contributors, k) {
  _.flatMap(contributors, function(contributor, k2) {
    let rewards = new BigNumber(0);
    _.flatMap(contributor.contributions, function(contribution) {
      rewards = rewards.plus(new BigNumber(contribution.contributionReward));
    })
    rewardsPerContributor[k] = rewards.toString();
  })
});

const vestingBatch: DynamicVestingInfo[] = _.flatMap(rewardsPerContributor, function(reward, contributor) {
  return generateVestings(
    startBlock, endBlock, contributor, reward, triple
    )
});

writeToFS('./data/hdx-vesting-hydra-crowdloan.json', vestingBatch);
