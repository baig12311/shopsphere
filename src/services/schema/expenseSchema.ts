import { z } from 'zod';

export const expenseSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, 'Expense title is required')
        .max(150, 'Title cannot exceed 150 characters'),

    amount: z
        .string()
        .trim()
        .min(1, 'Amount is required')
        .refine((value) => !isNaN(Number(value)), 'Enter a valid amount')
        .refine((value) => Number(value) > 0, 'Amount must be greater than 0'),

    category: z
        .string()
        .trim()
        .min(1, 'Category is required')
        .max(80, 'Category cannot exceed 80 characters'),

    expenseDate: z
        .string()
        .min(1, 'Expense date is required')
        .refine((value) => {
            const selectedDate = new Date(`${value}T00:00:00`);
            const today = new Date();

            today.setHours(0, 0, 0, 0);

            return (
                !isNaN(selectedDate.getTime()) &&
                selectedDate <= today
            );
        }, 'Future dates are not allowed'),

    paymentMethod: z.enum(
        ['cash', 'bank_transfer', 'card', 'other'],
        {
            error: 'Please select a payment method',
        }
    ),

    notes: z
        .string()
        .trim()
        .max(500, 'Notes cannot exceed 500 characters')
        .optional()
        .or(z.literal('')),
});