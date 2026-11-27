import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addExpense } from '../services/addExpense';

export const useAddExpense = (businessId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addExpense,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['expenses', businessId],
            });
        },
    });
};