
import bsxCrowdloanData from '../data/rewards.json'
import { Report } from '../reward'
import { DynamicVestingInfo, generateVestings, writeToFS } from './common'


// Generates vesting schedules for the HDX Bonus for participants in Basilisk crowdloan

const startBlock = '9334719';
const endBlock = '13834719';
const triple = true;

const vestingBatch: DynamicVestingInfo[] = (bsxCrowdloanData as Report).rewards.flatMap(reward => {
    return generateVestings(
        startBlock, endBlock, reward.address, reward.totalHdxReward, triple
    );
});

writeToFS('../data/hdx-vesting-snek-crowdloan.json', vestingBatch);
