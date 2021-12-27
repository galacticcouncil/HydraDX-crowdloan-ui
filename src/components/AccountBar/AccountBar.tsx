import { useCallback, useEffect, useRef, useState } from 'react';
import { Account } from 'src/hooks/useAccounts';
import { useClickAway } from 'react-use';
import './AccountBar.scss';
import { initial } from 'lodash';

export interface AccountBarProps {
    account?: Account,
    activeAccountLoading: boolean,
    initiallyLoaded: boolean,
    apiReady: boolean, 
    accounts?: Account[],
    getAllAccounts: () => void,
    setActiveAccountAddress: (accountAddress: string) => void,
    processorBlockHeight?: string,
    chainBlockHeight?: string,
    showAccountSelector: boolean,
    setShowAccountSelector: (showAccountSelector: boolean) => void
}

export const AccountBar = ({ 
    account, 
    activeAccountLoading,
    initiallyLoaded,
    accounts,
    setActiveAccountAddress,
    chainBlockHeight,
    processorBlockHeight,
    getAllAccounts,
    apiReady,
    showAccountSelector,
    setShowAccountSelector
}: AccountBarProps) => {
    const accountSelectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showAccountSelector) return;
        console.log('loading accounts');
        getAllAccounts();
    }, [showAccountSelector, getAllAccounts]);

    useClickAway(accountSelectorRef, () => setShowAccountSelector(false));

    const handleSelectActiveAccount = useCallback((account: Account) => {
        setActiveAccountAddress(account.address);
        setShowAccountSelector(false);
    }, [setActiveAccountAddress, setShowAccountSelector]);

    return <div>
        <p>Show account selector?: {showAccountSelector ? 'true' : 'false'}</p>
        <div
            ref={accountSelectorRef} 
            className={showAccountSelector ? 'visible': 'hidden'}>
            {
                accounts?.length
                    ? (
                        <div>
                            {accounts.map((account, i) => (
                                <div 
                                    key={i}
                                    onClick={_ => handleSelectActiveAccount(account)}
                                >
                                    {account.name} | {account.address} | {account.balance}
                                </div>
                            ))}
                        </div>
                    )
                    : (
                        <div>
                            No accounts available
                        </div>
                    )

                
            }
        </div>
        <div>
            <p>activeAccountLoading: {activeAccountLoading ? 'loading' : 'not loading'}</p>
            <p>Initially loaded: {initiallyLoaded ? 'already loaded' : 'not yet'}</p>
            <p>{chainBlockHeight} / {processorBlockHeight}</p>
            <p>{account?.address} | {account?.balance} | {account?.name}</p>
            
            <button onClick={_ => setShowAccountSelector(true)}>
                {!apiReady
                    ? 'Loading...'
                    : (
                        account
                            ? 'Change account'
                            : 'Connect account'
                    )
                }
            </button>
        </div>
    </div>
}