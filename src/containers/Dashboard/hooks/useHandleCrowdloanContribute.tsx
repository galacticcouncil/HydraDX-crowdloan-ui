import { useCallback } from 'react'
import { FormFields } from 'src/components/AccountBar/ContributionForm';
import { usePolkadotJsContext } from 'src/hooks/usePolkadotJs';

export const useHandleCrowdloanContribute = () => {
    const api = usePolkadotJsContext();
    return useCallback((formFields: FormFields) => {
        console.log('contributing', formFields.amount);
    }, []);
}