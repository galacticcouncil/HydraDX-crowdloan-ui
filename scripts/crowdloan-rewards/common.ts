import BigNumber from "bignumber.js"

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

export const generateVestings = function(
  startBlock: string,
  endBlock: string,
  address: string,
  rewards: string,
  triple: boolean
): DynamicVestingInfo[] {
    const vestingDuration = new BigNumber(endBlock).minus(new BigNumber(startBlock));

    const totalRewards = triple ? new BigNumber(rewards).multipliedBy(3) : new BigNumber(rewards);

    const rewardsPerPeriodFloat = totalRewards.dividedBy(vestingDuration);

    const rewardsSumOfDecimalAmounts = 
        rewardsPerPeriodFloat.modulo(1)
        .multipliedBy(vestingDuration)
        .decimalPlaces(0, BigNumber.ROUND_UP);

    const rewardsPerPeriodFixed = 
        rewardsPerPeriodFloat
        .decimalPlaces(0, 1);

    const rewardsMinusSumOfDecimals = 
        totalRewards
        .minus(rewardsSumOfDecimalAmounts);

    return [
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
            
        },
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
        }
    ]
};

export const writeToFS = function(path: String, vestingBatch: DynamicVestingInfo[]) {
  const fs = require('fs')

  fs.writeFile (path, JSON.stringify(vestingBatch, null, 4), function(err) {
          if (err) throw err
          console.log('complete')
      }
  );
}
