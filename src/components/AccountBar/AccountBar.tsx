import { useCallback, useEffect, useRef, useState } from 'react';
import { Account, useAccountsContext } from 'src/hooks/useAccounts';
import { useClickAway } from 'react-use';
import './AccountBar.scss';
import { initial } from 'lodash';

export interface AccountBarProps {
    account?: Account,
    loading: boolean,
    initiallyLoaded: boolean,
    accounts?: Account[],
    getAllAccounts: () => void,
    setActiveAccountAddress: (accountAddress: string) => void,
    processorBlockHeight?: string,
    chainBlockHeight?: string
}

export const AccountBar = ({ 
    account, 
    loading,
    initiallyLoaded,
    accounts,
    setActiveAccountAddress,
    chainBlockHeight,
    processorBlockHeight,
    getAllAccounts
}: AccountBarProps) => {
    const [showSelector, setShowSelector] = useState(false);
    const accountSelectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showSelector) return;
        getAllAccounts();
    }, [showSelector, getAllAccounts]);

    useClickAway(accountSelectorRef, () => setShowSelector(false));

    const handleSelectActiveAccount = useCallback((account: Account) => {
        setActiveAccountAddress(account.address);
        setShowSelector(false);
    }, [setActiveAccountAddress]);

    return <div>
        <p>Show selector?: {showSelector ? 'true' : 'false'}</p>
        <div
            ref={accountSelectorRef} 
            className={showSelector ? 'visible': 'hidden'}>
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
            <p>Loading: {loading ? 'loading' : 'not loading'}</p>
            <p>Initially loaded: {initiallyLoaded ? 'already loaded' : 'not yet'}</p>
            <p>{chainBlockHeight} / {processorBlockHeight}</p>
            <p>{account?.address} | {account?.balance} | {account?.name}</p>
            <button onClick={_ => setShowSelector(true)}>Connect account</button>
        </div>
    </div>
}