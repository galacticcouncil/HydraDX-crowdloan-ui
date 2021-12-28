import constate from 'constate';
import { useEffect, useState } from 'react';
import { usePolkadotJsContext } from './usePolkadotJs'

export const useLatestBlockHeight = () => {
    const api = usePolkadotJsContext();
    const [blockHeight, setBlockHeight] = useState<string | undefined>();

    useEffect(() => {
        api?.rpc.chain.subscribeNewHeads((header) => {
            const blockHeight = header.number.toString();
            setBlockHeight(blockHeight)
        });
    }, [api]);

    return blockHeight;
}

export const [LatestBlockHeightProvider, useLatestBlockHeightContext] = constate(useLatestBlockHeight);