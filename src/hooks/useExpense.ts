
import { useQuery } from "@tanstack/react-query";
import { getExpenses } from "../services/expense";

export const useExpenses = (businessId: string) => {
    return useQuery({
        queryKey: ['expenses', businessId],
        queryFn: () => getExpenses(businessId),
        enabled: !!businessId,
    });
};
