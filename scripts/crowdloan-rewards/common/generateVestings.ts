var assert = require('assert');
import BigNumber from "bignumber.js"
import { log } from './performVestings'

const HDX = new BigNumber(1_000_000_000_000);

export type RewardsData = {
    address: string,
    totalRewards: string
}

export type CalculatedRewards = {
    amountToBeVestedPerPeriod: BigNumber,
    amountToBeTransferred: BigNumber
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

export type TransferData = {
    address: string,
    amountToBeTransferred: string
}

export const generateVestingsAndTransfers = function(
    rewards: RewardsData[],
    startBlock: string,
    endBlock: string,
    prefix: string
) {
    log(`Generating vesting schedules for ${prefix} crowdloaners`);

    const vestingDuration = new BigNumber(endBlock).minus(new BigNumber(startBlock));
    let vestingsData: DynamicVestingInfo[] = [];
    let transfersData: TransferData[] = [];

    rewards.forEach(function(rewardsData) {
        const address = rewardsData.address;
        const totalRewards = new BigNumber(rewardsData.totalRewards);

        const calculatedRewards = rewardsPerPeriodAndSumOfDecimalAmounts(totalRewards, vestingDuration);
        
        const individualVestingsData = generateVestingsData(
            calculatedRewards.amountToBeVestedPerPeriod,
            address,
            startBlock,
            vestingDuration
        );
            
        vestingsData.push(individualVestingsData);

        const amountToBeTransferred = calculatedRewards.amountToBeTransferred.toString();
        transfersData.push({ address, amountToBeTransferred });
    });

    let totalRewardsBefore = calculateTotalRewardsBefore(rewards);
    let totalDistributedRewards = calculateTotalDistributedRewards(vestingsData, transfersData);
    validateVestingsData(totalRewardsBefore, totalDistributedRewards);

    const vestingsPath = `./data/hdx-vesting-${prefix}-crowdloan.json`
    const transfersPath = `./data/hdx-transfers-${prefix}-crowdloan.json`
    const totalRewardsPath = `./data/hdx-total-rewards-${prefix}-crowdloan.json`

    writeToFS(vestingsPath, vestingsData);
    writeToFS(transfersPath, transfersData);
    writeToFS(totalRewardsPath, { total_rewards: totalDistributedRewards });

    log(`Vesting schedules for ${prefix} written in ${vestingsPath}`);
    log(`Transfer data for ${prefix} written in ${transfersPath}`);
    log(`Total rewards distributed: ${totalDistributedRewards}`);
    log(`Total rewards written in ${totalRewardsPath}`)
};

const rewardsPerPeriodAndSumOfDecimalAmounts = function(
    rewards: BigNumber,
    vestingDuration: BigNumber
): CalculatedRewards {
    const rewardsPerPeriodFloat = rewards.dividedBy(vestingDuration);

    const amountToBeTransferred = 
        rewardsPerPeriodFloat.modulo(1)
        .multipliedBy(vestingDuration)
        .decimalPlaces(0, BigNumber.ROUND_UP);

    const amountToBeVestedPerPeriod = rewardsPerPeriodFloat.decimalPlaces(0, 1);

    return { amountToBeVestedPerPeriod, amountToBeTransferred }
}

const generateVestingsData = function(
    amountToBeVestedPerPeriod: BigNumber,
    address: string,
    startBlock: string,
    vestingDuration: BigNumber
): DynamicVestingInfo {
    let totalPeriodicRewards = amountToBeVestedPerPeriod.multipliedBy(vestingDuration);

    return {
        destination: address,
            schedule: {
                amountToBeVested: totalPeriodicRewards.toString(),
                start: startBlock,
                period: '1',
                per_period: amountToBeVestedPerPeriod.toString(),
                period_count: vestingDuration.toString()
        }
    }
}

const calculateTotalRewardsBefore = function(rewards: RewardsData[]) {
    return rewards.map(function(reward) {
        return new BigNumber(reward.totalRewards)
    }).reduce((sum, current) => sum.plus(current)) 
}

function calculateTotalDistributedRewards(
    vestingsData: DynamicVestingInfo[],
    transfersData: TransferData[]
): BigNumber {
    const totalVestedRewards = vestingsData.map(
        vesting => new BigNumber(vesting.schedule.per_period)
                    .multipliedBy(new BigNumber(vesting.schedule.period_count))
    ).reduce((sum, current) => sum.plus(current));

    const totalTransferRewards = transfersData.map(
        transfer => new BigNumber(transfer.amountToBeTransferred)
    ).reduce((sum, current) => sum.plus(current));

    return totalVestedRewards.plus(totalTransferRewards);
}

function validateVestingsData(totalRewards: BigNumber, totalVestedRewards: BigNumber) {
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
