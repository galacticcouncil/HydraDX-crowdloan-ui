import { useMemo } from 'react'
import { usePolkadotJsContext } from 'src/hooks/usePolkadotJs'

export const useLoading = () => {
    const api = usePolkadotJsContext();

    return useMemo(() => {
        return !api
    }, [api])
}