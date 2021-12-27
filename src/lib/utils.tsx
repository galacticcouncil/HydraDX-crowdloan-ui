import BigNumber from 'bignumber.js';
import millify from 'millify';

export const fromE6Precision = (value: string) => (
    new BigNumber(value)
        .dividedBy(new BigNumber(10).pow(6))
        .toFixed(0)
)

export const toE10Precision = (value: string) => (
    new BigNumber(value)
        .multipliedBy(new BigNumber(10).pow(10))
        .toFixed(0)
)

export const fromE10Precision = (value: string) => (
    new BigNumber(value)
        .dividedBy(new BigNumber(10).pow(10))
        .toFixed(10)
)

export const fromE12Precision = (value: string) => (
    new BigNumber(value)
        .dividedBy(new BigNumber(10).pow(12))
        .toFixed(12)
)
