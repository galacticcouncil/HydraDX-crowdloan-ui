import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { usePolkadotJsContext } from './usePolkadotJs';
import '@polkadot/api-augment';
import { useLatestBlockHeightContext } from './useLatestBlockHeight';
import constate from 'constate';
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';

export interface Account {
    address: string,
    name?: string,
    balance: string
}

export const useAccounts = () => {
    const [activeAccountAddress, setActiveAccountAddress] = useLocalStorage<string | undefined>('hdx-crowdloan-account');
    const [allAccounts, setAllAccounts] = useState<Account[]>([]);
    const api = usePolkadotJsContext();
    const [loading, setLoading] = useState(false);
    const latestBlockHeight = useLatestBlockHeightContext();
    const [initiallyLoaded, setInitiallyLoaded] = useState(false);

    const getAllAccounts = useCallback(() => {
        if (!api) return;

        (async () => {
            setLoading(true);
            await web3Enable('hydra-crowdloan');
            const accounts: Omit<Account, 'balance'>[] = (await web3Accounts())
                .map((account) => {
                    return {
                        // TODO: what's the polkadot encoding?
                        address: encodeAddress(decodeAddress(account.address), 0),
                        name: account.meta.name,
                    }
                });

            const accountsWithBalances: Account[] = (await api.query.system.account.multi(
                accounts.map(account => account.address)
            ))
                .map((accountInfo, i) => ({
                    ...accounts[i],
                    balance: accountInfo.data.free.toString()
                }))

            setAllAccounts(accountsWithBalances);
            setLoading(false);
            setInitiallyLoaded(true);
        })();
    }, [setAllAccounts, setLoading, api, setInitiallyLoaded]);

    // refetch active account balance with every new block, or when the active account changes
    useEffect(() => {
        // only do this in case there is an active account set
        // this will trigger the extension connection popup as well if required
        // this will refetch all the balances, but it will also refetch account names
        getAllAccounts();
    }, [activeAccountAddress, getAllAccounts, latestBlockHeight]);
    
    return {
        activeAccountAddress,
        setActiveAccountAddress,
        getAllAccounts,
        allAccounts,
        loading,
        initiallyLoaded
    }
}

export const [AccountsProvider, useAccountsContext] = constate(useAccounts);