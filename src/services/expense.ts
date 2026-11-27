
import { supabase } from "../lib/supabase";

// get expenses
export const getExpenses = async (businessId: string) => {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('business_id', businessId)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// get expense by id
export const getExpenseById = async (expenseId: string) => {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};
