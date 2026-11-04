
import { QueryClient, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

onlineManager.setEventListener(setOnline => {
    return NetInfo.addEventListener(state => {
        setOnline(
            !!state.isConnected &&
            state.isInternetReachable !== false
        );
    });
});

export const queryClient = new QueryClient({
    defaultOptions: {
        
        queries: {
            staleTime: 60 * 1000,
            retry: 2,
            networkMode: 'always',
            refetchOnReconnect: true,
        },
    },
});
