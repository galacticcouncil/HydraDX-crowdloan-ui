import BigNumber from 'bignumber.js';
import './ContributionForm.scss';
import { Controller, useForm } from 'react-hook-form'
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { Account } from 'src/hooks/useAccounts';
import { useCallback } from 'react';

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
    setShowAccountSelector: (showAccountSelector: boolean) => void
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
    // decimalLimit: 12,
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
    setShowAccountSelector
}: ContributionFormProps) => {
    const form = useForm<FormFields>();

    const handleSubmit = useCallback((formFields) => {
        activeAccount 
            ? onContribute(formFields)
            : setShowAccountSelector(true)
    }, []);

    return <div>
        <h2>ContributionForm</h2>
        <div>
            <p>Total contribution amount: {totalContributionAmount?.toString()}</p>
            <p>Total dilluted rewards: {totalRewards?.totalDillutedRewards.toString()}</p>
            <p>Total minimal rewards: {totalRewards?.totalMinimalRewards.toString()}</p>
        </div>
        
        <div>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <Controller 
                    control={form.control}
                    name={'amount'}
                    render={
                        (({ field }) => (
                            <MaskedInput 
                                mask={currencyMask}
                                ref={field.ref}
                                onChange={event => {
                                    const value = event.target.value.replaceAll(thousandsSeparatorSymbol, '');
                                    field.onChange(value);
                                }}
                            />
                        ))
                    }
                />

                <button type='submit'>
                    {!apiReady
                        ? 'Connecting...'
                        : (
                            !activeAccount
                                ? 'No account connected'
                                : 'Contribute'
                        )
                    }
                </button>
            </form>
        </div>
    </div>
}