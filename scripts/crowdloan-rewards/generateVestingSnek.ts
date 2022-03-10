
import bsxCrowdloanData from '../data/hdx-rewards-snek-crowdloan.json'
import { DynamicVestingInfo, generateVestings, writeToFS } from './common'


// Generates vesting schedules for the HDX Bonus for participants in Basilisk crowdloan

export type Report = {
  stats: {
      totalKsmRaised: string,
      totalBsxRewarded: string,
      totalHdxRewarded: string,
      totalContributionWeight: string,
      bsxAllocated: string,
      remaining: string,
  },
  rewards: Reward[]
}

export type Reward = {
  address: string,
  totalBsxReward: string,
  totalHdxReward: string,
  totalContribution: string,
  totalContributionWeight: string,
  contributions: OutputContribution[],
};

export type OutputContribution = {
  blockHeight: string,
  balance: string,
  hdxBonus: string,
  ksmPrice: string,
  multiplier: string,
  createdAt: string,
};

const startBlock = '9334719';
const endBlock = '13834719';
const triple = true;

const vestingBatch: DynamicVestingInfo[] = (bsxCrowdloanData as Report).rewards.flatMap(reward => {
    return generateVestings(
        startBlock, endBlock, reward.address, reward.totalHdxReward, triple
    );
});

writeToFS('../hdx-vesting-snek-crowdloandgd.json', vestingBatch);
