import { find } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useAccountsContext } from 'src/hooks/useAccounts'

export const useActiveAccount = () => {
    const { 
        activeAccountAddress, 
        allAccounts, 
        getAllAccounts,
        loading,
        setActiveAccountAddress
    } = useAccountsContext();

    useEffect(() => {
        activeAccountAddress && getAllAccounts();
    }, [activeAccountAddress, getAllAccounts]);

    const activeAccount = useMemo(() => {
        console.log('allAccounts', allAccounts, activeAccountAddress);
        return find(allAccounts, { address: activeAccountAddress });
    }, [activeAccountAddress, allAccounts]);

    return { activeAccount, loading, setActiveAccountAddress };
}