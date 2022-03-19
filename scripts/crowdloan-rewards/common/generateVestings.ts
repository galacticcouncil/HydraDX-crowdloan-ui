var assert = require('assert');
import BigNumber from "bignumber.js"
import { log } from './performVestings'

const HDX = new BigNumber(1_000_000_000_000);

export type RewardsData = {
    address: string,
    totalRewards: string
}


export type DynamicVestingInfo = {
  destination: string,
  schedule: {
      amountToBeVested: string,
      start: string,
      period: string,
      per_period: string,
      period_count: string 
  }
}

export const generateVestingsAndWriteToFs = function(
    rewards: RewardsData[],
    startBlock: string,
    endBlock: string,
    triple: boolean,
    prefix: string
) {
    log(`Generating vesting schedules for ${prefix} crowdloaners`);

    let totalRewards = new BigNumber(0);

    let vestingsData = rewards.flatMap(rewardData => {
        let rewards = new BigNumber(rewardData.totalRewards);
        rewards = triple ? rewards.multipliedBy(3) : rewards;

        totalRewards = totalRewards.plus(rewards);

        return generateVestings(startBlock, endBlock, rewardData.address, rewards);
    });

    let totalVestedRewards = calculateTotalVestedRewards(vestingsData);
    validateRewards(totalRewards, totalVestedRewards);

    const vestingsPath = `./data/hdx-vesting-${prefix}-crowdloan.json`
    const totalRewardsPath = `./data/hdx-total-rewards-${prefix}-crowdloan.json`

    writeToFS(vestingsPath, vestingsData);
    writeToFS(totalRewardsPath, { total_rewards: totalVestedRewards });

    log(`Vesting schedules for ${prefix} written in ${vestingsPath}`);
    log(`Total rewards distributed: ${totalVestedRewards}`);
    log(`Total rewards written in ${totalRewardsPath}`)
};

const generateVestings = function(
  startBlock: string,
  endBlock: string,
  address: string,
  rewards: BigNumber
): DynamicVestingInfo[] {
    const vestingDuration = new BigNumber(endBlock).minus(new BigNumber(startBlock));

    const rewardsPerPeriodFloat = rewards.dividedBy(vestingDuration);

    const rewardsSumOfDecimalAmounts = 
        rewardsPerPeriodFloat.modulo(1)
        .multipliedBy(vestingDuration)
        .decimalPlaces(0, BigNumber.ROUND_UP);

    const rewardsPerPeriodFixed = rewardsPerPeriodFloat.decimalPlaces(0, 1);

    const totalPeriodicRewards = rewardsPerPeriodFixed.multipliedBy(vestingDuration);

    return [
        // For every period we distribute rewards per period rounded down to fixed point
        {
            destination: address,
            schedule: {
                amountToBeVested: totalPeriodicRewards.toString(),
                start: startBlock,
                period: '1',
                per_period: rewardsPerPeriodFixed.toString(),
                period_count: vestingDuration.toString()
            }
        },
        // In the first period we distribute the rounded sum of all decimal amounts
        {
            destination: address,
            schedule: {
                amountToBeVested: rewardsSumOfDecimalAmounts.toString(),
                start: startBlock,
                period: '1',
                per_period: rewardsSumOfDecimalAmounts.toString(),
                period_count: '1'
            }
            
        }
    ]
};

function calculateTotalVestedRewards(vestingsData: DynamicVestingInfo[]): BigNumber {
    return vestingsData.map(
        vesting => new BigNumber(vesting.schedule.per_period)
                    .multipliedBy(new BigNumber(vesting.schedule.period_count))
    ).reduce((sum, current) => sum.plus(new BigNumber(current)));
}

function validateRewards(totalRewards: BigNumber, totalVestedRewards: BigNumber) {
    const differenceInRewards = totalVestedRewards.minus(totalRewards).absoluteValue();
    
    // There will always be a small difference in total rewards due to rounding
    // here we make sure that the difference is not greater than 1 HDX
    //
    assert(differenceInRewards.isLessThan(HDX));

    log(`Difference in rewards is ${differenceInRewards} which is less than 1 HDX`);
}

const writeToFS = function(path: String, input: any) {
  const fs = require('fs')

  fs.writeFile (path, JSON.stringify(input, null, 4), function(err) {
          if (err) throw err
      }
  );
}
