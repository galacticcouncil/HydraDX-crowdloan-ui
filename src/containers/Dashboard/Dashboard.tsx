import { useAccountData } from 'src/hooks/useAccountData';
import { useAccountsContext } from 'src/hooks/useAccounts';
import { useInitialData } from 'src/hooks/useInitialData';
import { useLatestBlockHeight } from 'src/hooks/useLatestBlockHeight';
import { useSiblingData } from 'src/hooks/useSiblingData';
import { AccountBar } from 'src/components/AccountBar/AccountBar';
import { useActiveAccount } from './hooks/useActiveAccount';
import { usePolkadotJsContext } from 'src/hooks/usePolkadotJs';
import { ContributionForm } from 'src/components/AccountBar/ContributionForm';
import { useHandleCrowdloanContribute } from './hooks/useHandleCrowdloanContribute';
import { useState } from 'react';

export const Dashboard = () => {
    const blockHeight = useLatestBlockHeight();
    const api = usePolkadotJsContext();

    const { 
        activeAccount, 
        loading: activeAccountLoading,
        setActiveAccountAddress,
    } = useActiveAccount();

    const { 
        getAllAccounts, 
        allAccounts, 
        loading: accountsLoading,
        initiallyLoaded: accountsInitiallyLoaded,
    } = useAccountsContext();

    const { 
        loading: initialDataLoading,
        incentive,
        ownHistoricalFundsPledged
    } = useInitialData();

    const {
        loading: accountDataLoading,
        contributions,
        accountTotalRewards,
        accountTotalContribution,
    } = useAccountData(incentive?.totalRewardsDistributed);

    const handleCrowdloanContribute = useHandleCrowdloanContribute();

    const [showAccountSelector, setShowAccountSelector] = useState(false);


    // const {
    //     loading: siblingDataLoading,
    //     siblingHistoricalFundsPledged,
    // } = useSiblingData(incentive?.siblingParachain?.id)

    return <>
        <div>
            <AccountBar 
                account={activeAccount} 
                accounts={allAccounts}
                getAllAccounts={getAllAccounts}
                activeAccountLoading={activeAccountLoading}
                initiallyLoaded={accountsInitiallyLoaded}
                setActiveAccountAddress={setActiveAccountAddress}
                chainBlockHeight={blockHeight}
                processorBlockHeight={incentive?.blockHeight}
                apiReady={!!api}
                showAccountSelector={showAccountSelector}
                setShowAccountSelector={setShowAccountSelector}
            />
        </div>

        <div>
            {/* graph */}
            {/* form */}
            <ContributionForm 
                totalContributionAmount={accountTotalContribution}
                totalRewards={accountTotalRewards}
                onContribute={handleCrowdloanContribute}
                apiReady={!!api}
                activeAccount={activeAccount}
                setShowAccountSelector={setShowAccountSelector}
            />
        </div>
    </>

    // return (<>
    //     <p>Dashboard</p>
    //     <p>{blockHeight} / {incentive?.blockHeight}</p>
    //     <p>API loading: {loading ? 'loading...' : 'loaded!'}</p>
    //     <p>Accounts loading: {accountsLoading ? 'loading...' : 'loaded!'}</p>
    //     <p>Initial data loading: { initialDataLoading ? 'loading...': 'loaded!' }</p>
    //     <p>Accounts data loading: { accountDataLoading ? 'loading...': 'loaded!' }</p>
    //     <p>Sibling data loading: { siblingDataLoading ? 'loading...': 'loaded!' }</p>


    //     <h2>Accounts</h2>
    //     <button onClick={_ => getAllAccounts()}>Get all accounts</button>
    //     <div>
    //         {allAccounts.map((account, i) => (
    //             <div key={i}>
    //                 <p>{account.name} | {account.address} | {account.balance}</p>
    //                 <p>Active: {account.address === activeAccountAddress ? 'active' : 'not active'}</p>
    //                 <button onClick={_ => setActiveAccountAddress(account.address)}>Set active</button>
    //             </div>
    //         ))}
    //     </div>
        
    //     <h2>Initial data</h2>
    //     <p>Block height: {incentive?.blockHeight}</p>
    //     <p>Lead percentage rate: {incentive?.leadPercentageRate}</p>
    //     <p>Total rewards distributed: {incentive?.totalRewardsDistributed}</p>

    //     <h2>Account data</h2>
    //     <p>Contribution count: {contributions?.length}</p>
    //     {contributions?.map(contribution => (
    //         <p>{contribution.contributionReward}</p>
    //     ))}
    //     <h4>Account rewards</h4>
    //     <p>Total current rewards: {accountRewards?.totalDillutedRewards.toString()}</p>
    //     <p>Total minimal rewards: {accountRewards?.totalMinimalRewards.toString()}</p>

    //     <h2>Own data</h2>
    //     <p>Data point count: {ownHistoricalFundsPledged?.length}</p>
    //     {ownHistoricalFundsPledged?.map(fundsPledged => (
    //         <p>{fundsPledged?.createdAt} | {fundsPledged.fundsPledged}</p>
    //     ))}

    //     <h2>Sibling data</h2>
    //     <p>Data point count: {siblingHistoricalFundsPledged?.length}</p>
    //     {siblingHistoricalFundsPledged?.map(fundsPledged => (
    //         <p>{fundsPledged?.createdAt} | {fundsPledged.fundsPledged}</p>
    //     ))}
    // </>)
}