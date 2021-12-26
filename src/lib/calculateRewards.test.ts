import BigNumber from "bignumber.js";
import log from "loglevel";
import config from "./../config";
import {
  calculateCurrentContributionReward,
  calculateDillutionMultiplier,
  calculateReimbursmentMultiplier,
  calculateCurrentDillutedContributionReward,
  calculateMinimalContributionReward,
  calculateContributionReward,
  calculateMinimalDillutedContributionReward,
} from "./calculateRewards";

log.setLevel("INFO");

describe("calculateCurrentRewards", () => {
  describe("calculateReimbursmentMultiplier", () => {
    // [leadPercentageRate, reimbursmentMultiplier]
    const dataset = [
      // 25% lead rate, 10% reimbursment multiplier
      [25, `${config.incentive.reimbursmentRange.from}00`],
      // 15% lead rate, 100% reimbursment multiplier
      [15, `${config.incentive.reimbursmentRange.to}.000`],
      [20, "0.550"],
      // out of bounds for the defined scale
      [30, "0.100"], // leadPercentageRate above 25%
      [10, "1.000"], // leadPercentageRate below 15%
      // extreme out of bound values
      [-5000000, "1.000"],
      [50000000, "0.100"],
    ];

    it.each(dataset)(
      "should calculate the reimbursment multiplier",
      (leadPercentageRate, expectedReimbursmentMultiplier) => {
        const reimbursmentMultiplier = calculateReimbursmentMultiplier(
          leadPercentageRate as number
        ).toFixed(3);
        expect(reimbursmentMultiplier).toEqual(expectedReimbursmentMultiplier);
      }
    );
  });

  describe("calculateDillutionMultiplier", () => {
    const dataset = [
      [
        new BigNumber(config.incentive.allocatedHDXSupply)
          .multipliedBy(1.5)
          .toString(),
        "0.667",
      ],
      // totalRewardsDistributed same as the allocatedHDXSupply
      [config.incentive.allocatedHDXSupply, "1.000"],
      // totalRewardsDistributed = allocatedHDXSupply * 2
      [
        new BigNumber(config.incentive.allocatedHDXSupply)
          .multipliedBy(2)
          .toString(),
        "0.500",
      ],
      // don't dillute when totalRewardsDistributed < allocatedHDXSupply
      [
        new BigNumber(config.incentive.allocatedHDXSupply)
          .multipliedBy(0.5)
          .toString(),
        "1.000",
      ],
    ];

    it.each(dataset)(
      "should calculate the dillution multiplier",
      (totalDistributedRewards, expectedDillutionMultiplier) => {
        const dillutionMultiplier = calculateDillutionMultiplier(
          totalDistributedRewards
        );
        expect(dillutionMultiplier.toFixed(3)).toEqual(
          expectedDillutionMultiplier
        );
      }
    );
  });

  describe("calculateContributionReward", () => {
    const dataset = [
      // dotAmount, reimbursmentMultiplier, hdxAmount
      // maximum reimbursment 100%
      ["1", config.incentive.reimbursmentRange.to, "278.82"],
      // minimum reimbursment 10%
      ["1", config.incentive.reimbursmentRange.from, "27.88"],
    ];

    it.each(dataset)(
      "should calculate the contribution reward",
      (
        contributionAmount,
        reimbursmentMultiplierString,
        expectedContributionReward
      ) => {
        const reimbursmentMultiplier = new BigNumber(
          reimbursmentMultiplierString
        );
        const contributionReward = calculateContributionReward({
          contributionAmount: contributionAmount as string,
          reimbursmentMultiplier,
        }).toFixed(2);

        expect(contributionReward).toEqual(expectedContributionReward);
      }
    );
  });

  describe.only("calculateCurrentContributionReward", () => {
    const dataset = [
      // [dotAmount, leadPercentageRate, hdxAmount]
      ["10", 15, "2788"],
      // max amount per 1 DOT without dillution
      ["1", 15, "279"], // rounded up
      // min amount per 1 DOT  without dillution
      ["1", 25, "28"],
      // out of bounds cases
      ["1", 10, "279"],
      ["1", 30, "28"],
      ["1", -10, "279"],
    ];

    it.each(dataset)(
      "should calculate contribution reward",
      (contributionAmount, leadPercentageRate, expectedContributionReward) => {
        const contributionReward = calculateCurrentContributionReward({
          contributionAmount: contributionAmount as string,
          leadPercentageRate: leadPercentageRate as number,
        });

        expect(contributionReward.toFixed(0)).toEqual(
          expectedContributionReward
        );
      }
    );
  });

  describe("calculateMinimalContributionReward", () => {
    const dataset = [
      // [dotAmount, hdxAmount]
      ["10", "278.82"],
      ["1", "27.88"],
    ];

    it.each(dataset)(
      "should calculate the minimal contribution reward",
      (contributionAmount, expectedContributionReward) => {
        const contributionReward = calculateMinimalContributionReward(
          contributionAmount as string
        );
        expect(contributionReward.toFixed(2)).toEqual(
          expectedContributionReward
        );
      }
    );
  });

  describe("calculateCurrentDillutedContributionReward", () => {
    const dataset = [
      ["28", config.incentive.allocatedHDXSupply, "28"],
      // 28 HDX reward, with (in theory) twice as much HDX distributed as allocated, dilluted in half
      [
        "28",
        new BigNumber(config.incentive.allocatedHDXSupply)
          .multipliedBy(2)
          .toFixed(0),
        "14",
      ],
    ];

    it.each(dataset)(
      "should calculate the dilluted contribution reward",
      (
        contributionReward,
        totalRewardsDistributed,
        expectedDillutedContributionReward
      ) => {
        const dillutedContributionReward = calculateCurrentDillutedContributionReward(
          {
            contributionReward: new BigNumber(contributionReward),
            totalRewardsDistributed,
          }
        );

        expect(dillutedContributionReward.toFixed(0)).toEqual(
          expectedDillutedContributionReward
        );
      }
    );
  });

  describe("calculateMinimalDillutedContributionReward", () => {
    const dataset = [
      ["28", "12.553"],
      ["2800", "1255.296"],
    ];

    it.each(dataset)(
      "should calculate the dilluted contribution reward",
      (
        contributionReward,
        expectedDillutedContributionReward
      ) => {
        const dillutedContributionReward = calculateMinimalDillutedContributionReward(
            new BigNumber(contributionReward)
        );

        expect(dillutedContributionReward.toFixed(3)).toEqual(
          expectedDillutedContributionReward
        );
      }
    );
  });
});
