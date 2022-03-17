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
    const start = new BigNumber(startBlock);

    const vestingDuration = new BigNumber(endBlock).minus(new BigNumber(startBlock));

    const totalRewards = triple ? new BigNumber(rewards).multipliedBy(3) : new BigNumber(rewards);

    const rewardsPerPeriodFloat = totalRewards.dividedBy(vestingDuration);

    const rewardsSumOfDecimalAmounts = 
        rewardsPerPeriodFloat.modulo(1)
        .multipliedBy(vestingDuration)
        .decimalPlaces(0, BigNumber.ROUND_UP);

    const rewardsPerPeriodFixed = rewardsPerPeriodFloat.decimalPlaces(0, 1);

    const rewardsMinusSumOfDecimals = totalRewards.minus(rewardsSumOfDecimalAmounts);

    // First period
    const amountFirst = rewardsSumOfDecimalAmounts.plus(rewardsPerPeriodFixed).toString();
    const startFirst = start.toString();

    // Other periods
    const amountOther = rewardsMinusSumOfDecimals.minus(rewardsPerPeriodFixed).toString();
    const startOther = start.plus(1).toString();
    const perPeriodOther = rewardsPerPeriodFixed.toString();
    const periodCountOther = vestingDuration.minus(1).toString();
    
    return [
        // For the first period we distribute rewardsPerPeriodFixed plus the rounded sum of all decimal amounts
        {
            destination: address,
            schedule: {
                amountToBeVested: amountFirst,
                start: startFirst,
                period: '1',
                per_period: amountFirst,
                period_count: '1'
            }
            
        },
        // For every other period we distribute rewards per period rounded down to fixed point
        {
            destination: address,
            schedule: {
                amountToBeVested: amountOther,
                start: startOther,
                period: '1',
                per_period: perPeriodOther,
                period_count: periodCountOther
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
