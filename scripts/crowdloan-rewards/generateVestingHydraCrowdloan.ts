import BigNumber from "bignumber.js"
import _ from 'lodash'
import hdxCrowdloanData from '../data/hydra-crowdloan-rewards-raw.json'
import { DynamicVestingInfo, generateVestings, writeToFS } from './common'

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

// Generates vesting schedules for the HDX Bonus for participants in Basilisk crowdloan

const startBlock = '9334719';
const endBlock = '13834719';
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

writeToFS('../data/hdx-vesting-hydra-crowdloan.json', vestingBatch);
