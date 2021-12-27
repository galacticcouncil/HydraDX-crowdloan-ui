import { useCallback, useEffect, useRef } from 'react';
import { Account } from 'src/hooks/useAccounts';
import { useClickAway } from 'react-use';
import './AccountBar.scss';
import { fromE10Precision } from 'src/lib/utils';
import millify from 'millify';

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

    return <div className='accountSelector'>
        <div
            ref={accountSelectorRef} 
            className={'accountSelector__overlay' + (showAccountSelector ? '' : ' hidden')}>
            {
                accounts?.length
                    ? (
                        <div className='accountSelector__overlay__list'>
                            {accounts.map((account, i) => (
                                <div className='accountSelector__account'
                                    key={i}
                                    onClick={_ => handleSelectActiveAccount(account)}
                                >
                                    <div className='accountSelector__account__name'>{account.name}</div>|
                                    <div className='accountSelector__account__balance'>{millify(parseFloat(fromE10Precision(account.balance)))} DOT</div>|
                                    <div className='accountSelector__account__address'>{account.address}</div>
                                </div>
                            ))}
                        </div>
                    )
                    : (
                        <div className='accountSelector__overlay__list__empty'>
                            No accounts available
                        </div>
                    )

                
            }
        </div>
        <div className='accountSelector__accountInfo'>
            {/* <p>activeAccountLoading: {activeAccountLoading ? 'loading' : 'not loading'}</p>
            <p>Initially loaded: {initiallyLoaded ? 'already loaded' : 'not yet'}</p> */}
            {/* <div>{chainBlockHeight} / {processorBlockHeight}</div> */}
            
            <div className='accountSelector__account account_selector__accountInfo__info' onClick={_ => setShowAccountSelector(true)}>
                [{!apiReady
                    ? 'Loading...'
                    : (
                        account
                            ? (
                                <>
                                    <div className='accountSelector__account__name'>{account?.name}</div>|
                                    <div className='accountSelector__account__balance'>{millify(parseFloat(fromE10Precision(account?.balance)))} DOT</div>|
                                    <div className='accountSelector__account__address'>{account?.address}</div>
                                </>
                            )
                            : 'Connect account'
                    )
            }]
            </div>
            
        </div>
    </div>
}