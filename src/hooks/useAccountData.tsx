import { gql, useLazyQuery } from '@apollo/client'
import BigNumber from 'bignumber.js';
import log from 'loglevel';
import { useEffect, useMemo } from 'react';
import { calculateCurrentDillutedContributionReward, calculateMinimalDillutedContributionReward } from 'src/lib/calculateRewards';
import { useAccountsContext } from './useAccounts';
import { useLatestBlockHeight, useLatestBlockHeightContext } from './useLatestBlockHeight';

log.setLevel('DEBUG');

export interface AccountDataQueryResponse {
    contributions: {
        balance: string,
        contributionReward: string
    }[]
}

export const ACCOUNT_DATA_QUERY = gql`
    query AccountData($accountId: String!) {
        contributions(where: {account: {accountId_eq: $accountId}}){
            balance
            contributionReward
        }
    }
`
export const useAccountData = (totalRewardsDistributed?: string) => {
    const { activeAccountAddress } = useAccountsContext();
    const blockHeight = useLatestBlockHeightContext()

    const [fetchAccountData, { data, loading, networkStatus, refetch }] = useLazyQuery<AccountDataQueryResponse>(
        ACCOUNT_DATA_QUERY,
        { 
            notifyOnNetworkStatusChange: true,
            nextFetchPolicy: 'no-cache',
            variables: {
                accountId: activeAccountAddress
            }
        }
    );
    const accountTotalRewards = useMemo(() => {
        if (!totalRewardsDistributed || !data) return;

        const totalRewards = data.contributions?.reduce((totalRewards, contribution) => (
            totalRewards.plus(contribution.contributionReward)
        ), new BigNumber(0)); // TODO: this is dangerous

        if (!totalRewards) return;

        const rewards = {
            totalDillutedRewards: calculateCurrentDillutedContributionReward({
                contributionReward: new BigNumber(totalRewards.toString()),
                totalRewardsDistributed
            }),
            totalMinimalRewards: calculateMinimalDillutedContributionReward(totalRewards)
        };

        return rewards;
    }, [data, totalRewardsDistributed]);

    const accountTotalContribution = useMemo(() => {
        return data?.contributions?.reduce((totalContribution, contribution) => {
            return totalContribution.plus(contribution.balance)
        }, new BigNumber(0));
    }, [data]);

    useEffect(() => {
        if (!activeAccountAddress) return;
        const params = {
            variables: {
                accountId: activeAccountAddress
            }
        };

        console.log('active account address changed', params);

        !refetch
            ? fetchAccountData(params)
            : refetch(params)
    }, [activeAccountAddress, fetchAccountData, refetch, blockHeight]);

    return {
        ...data,
        accountTotalRewards,
        accountTotalContribution,
        loading,
        networkStatus
    }
}