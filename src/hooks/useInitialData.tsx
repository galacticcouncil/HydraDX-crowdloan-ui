import { gql, useLazyQuery } from '@apollo/client'
import { useEffect } from 'react';
import config from 'src/config';
import { useLatestBlockHeightContext } from './useLatestBlockHeight';

export interface InitialDataQueryResponse {
    incentive?: {
        totalRewardsDistributed: string,
        leadPercentageRate: string,
        blockHeight: string,
        siblingParachain?: {
            id?: string
        }
    },
    ownParachain: {
        fundsPledged: string,
    }
}

export const INITIAL_DATA_QUERY = gql`
    query InitialData($ownParaId: ID!) {
        incentive: incentiveById(id: "incentive") {
            totalRewardsDistributed
            leadPercentageRate
            blockHeight,
            siblingParachain {
                id
            }
        }

        # TODO: add fetching only of 3 days old data using the block height filter
        ownParachain: parachainById(id: $ownParaId) {
            fundsPledged,
            # TODO: add createdAt for graph
        }
    }
`

export const useInitialData = () => {
    const latestBlockHeight = useLatestBlockHeightContext();
    const [fetchInitialData, { data, loading, networkStatus, refetch }] = useLazyQuery<InitialDataQueryResponse>(
        INITIAL_DATA_QUERY, 
        { 
            notifyOnNetworkStatusChange: true,
            variables: {
                ownParaId: config.ownParaId
            },
            nextFetchPolicy: 'no-cache'
        }
    );
    
    useEffect(() => {
        console.log('refetching', latestBlockHeight);
        if (!latestBlockHeight) return;
        refetch ? refetch() : fetchInitialData();
    }, [latestBlockHeight, fetchInitialData, refetch]);

    return {
        ...data,
        loading,
        networkStatus
    }
}