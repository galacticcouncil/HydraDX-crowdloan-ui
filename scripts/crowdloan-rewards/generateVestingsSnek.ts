
import bsxCrowdloanData from '../data/hdx-raw-rewards-snek-crowdloan.json'
import { RewardsData, generateVestingsAndWriteToFs } from './common/generateVestings'


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

// At or around 24 September 2021, 18.00 (1 day after Basilisk auction win)
const startBlock = '6965740';
// At or around 05 August 2022, 18.00 (1 day before end of Basilisk parachain lease)
const endBlock = '11501740';
const triple = true;

function main() {
  const rewardsData: RewardsData[] = normalizeRewardsData();

  generateVestingsAndWriteToFs(rewardsData, startBlock, endBlock, triple, 'snek');
}

function normalizeRewardsData(): RewardsData[] {
  return (bsxCrowdloanData as Report).rewards.map(reward => {
    let data: RewardsData = {
      address: reward.address,
      totalRewards: reward.totalHdxReward
    };

    return data;
  });
}

try {
  main()

} catch(e) {
  console.log(e)
  process.exit()
}
