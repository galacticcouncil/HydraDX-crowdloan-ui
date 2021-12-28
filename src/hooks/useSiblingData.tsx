import { gql, useLazyQuery } from '@apollo/client'
import { useEffect } from 'react';
import { useLatestBlockHeightContext } from './useLatestBlockHeight'

export interface SiblingDataQueryResponse {
    siblingParachain: {
        fundsPledged: string,
    }
}

export const SIBLING_DATA_QUERY = gql`
    query SiblingData($siblingParaId: ID!) {
        # TODO: add fetching only of 3 days old data using the block height filter
        siblingParachain: parachainById(id: $siblingParaId) {
            fundsPledged,
        }
    }
` 
export const useSiblingData = (siblingParaId?: string) => {
    const latestBlockHeight = useLatestBlockHeightContext();
    const [fetchSiblingData, { data, loading, networkStatus }] = useLazyQuery<SiblingDataQueryResponse>(
        SIBLING_DATA_QUERY,
        { 
            notifyOnNetworkStatusChange: true,
            nextFetchPolicy: 'no-cache'
        },
    );

    useEffect(() => {
        siblingParaId && fetchSiblingData({
            variables: { siblingParaId }
        });
    }, [latestBlockHeight, fetchSiblingData, siblingParaId]);

    return {
        ...data,
        loading,
        networkStatus
    }
}