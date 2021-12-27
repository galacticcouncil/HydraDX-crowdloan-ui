import BigNumber from 'bignumber.js';

export const fromE6Precision = (value: string) => (
    new BigNumber(value)
        .dividedBy(new BigNumber(10).pow(6))
        .toFixed(0)
)