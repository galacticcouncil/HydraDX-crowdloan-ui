import { ApiPromise, WsProvider } from '@polkadot/api';
import { useEffect, useState } from 'react';
import config from 'src/config';
import constate from 'constate';

export const usePolkadotJs = () => {
    const [api, setApi] = useState<ApiPromise | undefined>();

    useEffect(() => {
        (async () => {
            const wsProvider = new WsProvider(config.nodeUrl);
            const api = await ApiPromise.create({ provider: wsProvider });
            setApi(api);
        })()
    }, [setApi]);

    return api;
}

export const [PolkadotJsProvider, usePolkadotJsContext] = constate(usePolkadotJs);