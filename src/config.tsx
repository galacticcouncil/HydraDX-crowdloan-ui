import BigNumber from "bignumber.js";

const config = {

    // processorUrl: 'http://localhost:4000/graphql',
    processorUrl: 'https://api-crowdloan-basilisk.hydradx.io/graphql',
    nodeUrl: 'wss://ksm-arch-01.hydration.cloud',

    oracle: {
        dotToUSD: '25',
        // HDX price after trippling
        hdxToUSD: new BigNumber('0.08059').dividedBy('3'),
    },
    incentive: {
        // compounded 14% APY
        opportunityCost: '0.2996',
        reimbursmentRange: {
            // the incentive scheme is actually 100%-10%,
            // its reversed here for the sake of the linear scale
            from: 0.1,
            to: 1
        },
        leadPercentageCliff: {
            from: 15,
            to: 25,
        },
        // by default no dillution is applied, the multiplier is '1'
        defaultDillutionMultiplier: '1',
        // TODO: can this have more precision if we calculate it on the spot using BigNumber? (probably not)
        minimalDillutionMultiplier: '0.4483199822',
        allocatedHDXSupply: '1000000000'
    }
};

export default config;
