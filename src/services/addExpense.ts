
import { supabase } from "../lib/supabase";

// add expense
export const addExpense = async ({
    businessId,
    title,
    amount,
    category,
    expenseDate,
    paymentMethod,
    notes,
}: {
    businessId: string;
    title: string;
    amount: number;
    category: string;
    expenseDate: string;
    paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'other';
    notes?: string | null;
}) => {
    const { data, error } = await supabase
        .from('expenses')
        .insert({
            business_id: businessId,
            title,
            amount,
            category,
            expense_date: expenseDate,
            payment_method: paymentMethod,
            notes: notes ?? null,
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};
