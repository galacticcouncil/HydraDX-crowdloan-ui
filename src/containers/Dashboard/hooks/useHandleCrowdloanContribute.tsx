import { web3FromAddress } from '@polkadot/extension-dapp';
import { useCallback, useState } from 'react'
import { FormFields } from 'src/components/AccountBar/ContributionForm';
import config from 'src/config';
import { useAccountsContext } from 'src/hooks/useAccounts';
import { usePolkadotJsContext } from 'src/hooks/usePolkadotJs';
import { toE10Precision } from 'src/lib/utils';

export enum ContributionStatus {
    NOT_SENT,
    LOADING,
    SUCCESSFUL,
    FAILED
}

export const useHandleCrowdloanContribute = () => {
    const api = usePolkadotJsContext();
    const { activeAccountAddress } = useAccountsContext();
    const [contributionStatus, setContributionStatus] = useState<ContributionStatus>(ContributionStatus.NOT_SENT);
    const handleCrowdloanContribute =  useCallback((formFields: FormFields) => {
        if (!api || !activeAccountAddress) return;

        setContributionStatus(ContributionStatus.LOADING);
        (async () => {
            try {
                const { signer } = await web3FromAddress(activeAccountAddress);

                await api.tx.crowdloan.contribute(
                    config.ownParaId,
                    toE10Precision(formFields.amount),
                    null
                )
                    .signAndSend(
                        activeAccountAddress,
                        { signer },
                        ({ status, events }) => {
                            if (status.isInBlock || status.isFinalized) {
                                events
                                    .filter(({ event }) => api.events.system.ExtrinsicFailed.is(event))
                                    .length
                                        ? setContributionStatus(ContributionStatus.FAILED)
                                        : setContributionStatus(ContributionStatus.SUCCESSFUL)
                            }
                        }
                    )
            } catch (e) {
                console.log('failed');
                console.error('contribution failed', e);
                setContributionStatus(ContributionStatus.FAILED)
            }
        })();
    }, [api, activeAccountAddress]);

    console.log('contributionStatus', contributionStatus);
    return { handleCrowdloanContribute, contributionStatus }
}