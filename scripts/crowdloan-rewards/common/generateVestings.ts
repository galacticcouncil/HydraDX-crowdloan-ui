var assert = require('assert');
import BigNumber from "bignumber.js"
import { bindAll } from "lodash"
import { log } from './performVestings'

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

    validateVestingsData(vestingsData, totalRewards, triple);

    const vestingsPath = `./data/hdx-vesting-${prefix}-crowdloan.json`
    const totalRewardsPath = `./data/hdx-total-rewards-${prefix}-crowdloan.json`

    writeToFS(vestingsPath, vestingsData);
    writeToFS(totalRewardsPath, { total_rewards: totalRewards });

    log(`Vesting schedules for ${prefix} written in ${vestingsPath}`);
    log(`Total rewards distributed: ${totalRewards}`);
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

    const rewardsMinusSumOfDecimals = rewards.minus(rewardsSumOfDecimalAmounts);

    return [
        // For every period we distribute rewards per period rounded down to fixed point
        {
            destination: address,
            schedule: {
                amountToBeVested: rewardsMinusSumOfDecimals.toString(),
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

function validateVestingsData(
    vestingsData: DynamicVestingInfo[],
    totalRewards: BigNumber,
    triple: Boolean
) {
    const totalVestedRewards = vestingsData.map(
            vesting => new BigNumber(vesting.schedule.amountToBeVested)
        ).reduce((sum, current) => sum.plus(new BigNumber(current)));

    assert(totalVestedRewards.isEqualTo(totalRewards));
}

const writeToFS = function(path: String, input: any) {
  const fs = require('fs')

  fs.writeFile (path, JSON.stringify(input, null, 4), function(err) {
          if (err) throw err
      }
  );
}
