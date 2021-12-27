import BigNumber from 'bignumber.js';
import './ContributionForm.scss';
import { Controller, useForm } from 'react-hook-form'
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { Account } from 'src/hooks/useAccounts';
import { useCallback, useEffect, useState } from 'react';
import { ContributionStatus } from 'src/containers/Dashboard/hooks/useHandleCrowdloanContribute';
import { calculateCurrentContributionReward, calculateCurrentDillutedContributionReward, calculateDillutedContributionReward, calculateMinimalContributionReward, calculateMinimalDillutedContributionReward } from 'src/lib/calculateRewards';
import { watch } from 'fs';

export interface FormFields {
    amount: string
}

export interface ContributionFormProps {
    totalContributionAmount?: BigNumber,
    totalRewards?: {
        totalDillutedRewards: BigNumber,
        totalMinimalRewards: BigNumber
    },
    onContribute: (formFields: FormFields) => void,
    apiReady: boolean,
    activeAccount?: Account,
    setShowAccountSelector: (showAccountSelector: boolean) => void,
    contributionStatus: ContributionStatus,
    incentive?: {
        leadPercentageRate: string,
        totalRewardsDistributed: string
    }
}

export const thousandsSeparatorSymbol = ' ';
export const currencyMask = createNumberMask({
    prefix: '',
    suffix: '',
    includeThousandsSeparator: true,
    thousandsSeparatorSymbol,
    allowDecimal: true,
    decimalSymbol: '.',
    // TODO: adjust decimal limit dependin on the selected MetricUnit
    decimalLimit: 1,
    // integerLimit: 7,
    allowNegative: false,
    allowLeadingZeroes: false,
})

export const ContributionForm = ({
    totalContributionAmount,
    totalRewards,
    onContribute,
    apiReady,
    activeAccount,
    setShowAccountSelector,
    contributionStatus,
    incentive
}: ContributionFormProps) => {
    const form = useForm<FormFields>();
    const [contributionRewards, setContributionRewards] = useState({
        current: '0',
        minimal: '0',
    })

    const watchAmount = form.watch('amount');

    useEffect(() => {
        if (!incentive) return;

        setContributionRewards({
            current: calculateCurrentDillutedContributionReward({
                contributionReward: calculateCurrentContributionReward({
                    contributionAmount: watchAmount || '0',
                    leadPercentageRate: new BigNumber(incentive?.leadPercentageRate)
                        .dividedBy(new BigNumber(10).pow(6))
                        .toNumber()
                }),
                totalRewardsDistributed: incentive.totalRewardsDistributed
            }).toFixed(6),
            minimal: calculateMinimalDillutedContributionReward(
                calculateMinimalContributionReward(watchAmount || '0')
            ).toFixed(6)
        })
    }, [watchAmount, incentive]);

    const handleSubmit = useCallback((formFields) => {
        activeAccount 
            ? onContribute(formFields)
            : setShowAccountSelector(true)
    }, [activeAccount, setShowAccountSelector, onContribute]);

    return <div>
        <h2>ContributionForm</h2>
        <div>
            <p>Total contribution amount: {totalContributionAmount?.toString()}</p>
            <p>Total dilluted rewards: {totalRewards?.totalDillutedRewards.toString()}</p>
            <p>Total minimal rewards: {totalRewards?.totalMinimalRewards.toString()}</p>
        </div>
        
        <div>
            <p>Current contribution reward: {contributionRewards.current}</p>
            <p>Minimal contribution reward: {contributionRewards.minimal}</p>
        </div>

        <div>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                {form.formState.isDirty && form.formState.isValid ? 'valid' : 'not valid'}
                <Controller 
                    control={form.control}
                    name={'amount'}
                    rules={{
                        validate: value => (
                            value && parseFloat(value.replaceAll(thousandsSeparatorSymbol, '')) >= 0.5
                        )
                    }}
                    render={
                        (({ field }) => (
                            <MaskedInput 
                                mask={currencyMask}
                                {...field}
                                onChange={event => {
                                    const value = event.target.value.replaceAll(thousandsSeparatorSymbol, '');
                                    field.onChange(value);
                                    form.trigger('amount');
                                }}
                                
                            />
                        ))
                    }
                />

                <button 
                    type='submit'
                    disabled={!apiReady}>
                    {!apiReady
                        ? 'Connecting...'
                        : (
                            !activeAccount
                                ? 'No account connected'
                                : 'Contribute'
                        )
                    }
                </button>

                {(() => {
                    switch(contributionStatus){
                        case ContributionStatus.FAILED:
                            return 'Contribution failed'
                        case ContributionStatus.SUCCESSFUL:
                            return 'Contribution successful'
                        default:
                            return '';
                    }
                })()}
            </form>
        </div>
    </div>
}