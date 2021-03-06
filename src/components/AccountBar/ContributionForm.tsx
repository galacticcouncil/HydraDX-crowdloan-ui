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
import millify from 'millify';
import { fromE10Precision, fromE12Precision } from 'src/lib/utils';

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
    decimalLimit: 3,
    integerLimit: 10,
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
                calculateCurrentContributionReward({
                    contributionAmount: watchAmount || '0',
                    leadPercentageRate: new BigNumber(incentive?.leadPercentageRate)
                        .dividedBy(new BigNumber(10).pow(6))
                        .toNumber()
                })
            ).toFixed(6)
        })
    }, [watchAmount, incentive]);

    const handleSubmit = useCallback((formFields) => {
        activeAccount 
            ? onContribute(formFields)
            : setShowAccountSelector(true)
    }, [activeAccount, setShowAccountSelector, onContribute]);

    return <div className='contribute'>
        <h2>Contribute</h2>
        <div className='contribute__past'>
            <div>Your contribution: {totalContributionAmount && millify(parseFloat(fromE10Precision(totalContributionAmount.toFixed(0))))} DOT</div>
            {/* <div>Total rewards: {totalRewards?.totalDillutedRewards.toString()}</div> */}
            <div>Your minimum rewards: {totalRewards?.totalMinimalRewards && millify(parseFloat(fromE12Precision(totalRewards?.totalMinimalRewards.toFixed(0))))} HDX</div>
        </div>
        
        <div className='contribute__current'>
            <div>Current rewards: {millify( parseFloat( contributionRewards.current))} HDX</div>
            <div>Minimum rewards: {millify( parseFloat( contributionRewards.minimal))} HDX</div>
        </div>

        <div>
            <form className='contribute__form' onSubmit={form.handleSubmit(handleSubmit)}>
                {/* {form.formState.isDirty && form.formState.isValid ? 'valid' : 'not valid'} */}
                <Controller 
                    control={form.control}
                    name={'amount'}
                    rules={{
                        validate: value => (
                            value && parseFloat(value.replaceAll(thousandsSeparatorSymbol, '')) >= 5
                        )
                    }}
                    render={
                        (({ field }) => (
                            <MaskedInput 
                                mask={currencyMask}
                                autoComplete='off'
                                placeholder='100 000'
                                disabled={true}
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
                    disabled={true}>
                    Crowdloan finished
                </button>

                <div className='status'>
                    {(() => {
                        return (
                            form.formState.errors.amount 
                                ? <div className='status__info'>Minimal contribution is 5 DOT</div> 
                                : <></>
                            )
                    })()}
                    {(() => {
                        switch(contributionStatus){
                            case ContributionStatus.FAILED:
                                return <div className='status__error'>Contribution failed</div>
                            case ContributionStatus.SUCCESSFUL:
                                return <div className='status__info'>Contribution successful, your rewards are being processed and will show up momentarily.</div>
                            case ContributionStatus.LOADING:
                                return <div className='status__info'>Contribution loading</div>
                            default:
                                return '';
                        }
                    })()}
                </div>
            </form>
        </div>
    </div>
}