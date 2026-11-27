
import { useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import Colors from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Input from '../../src/components/common/Input';
import SelectInput from '../../src/components/common/SelectInput';
import Button from '../../src/components/common/Button';
import Icon from '../../src/components/common/Icon';
import CustomEmptyComponent from '../../src/components/common/CustomEmptyComponent';
import CustomBottomSheet from '../../src/components/common/CustomBottomSheet';

import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useAddExpense } from '../../src/hooks/useAddExpense';
import { useToast } from '../../src/context/ToastContext';
import { expenseCategories } from '../../src/services/data/expenseCategories';
import { expenseSchema } from '../../src/services/schema/expenseSchema';

import styles from './AddExpenseStyle';

const paymentMethods = [
    { id: 'cash', name: 'Cash', value: 'cash' },
    { id: 'bank_transfer', name: 'Bank Transfer', value: 'bank_transfer' },
    { id: 'card', name: 'Card', value: 'card' },
    { id: 'other', name: 'Other', value: 'other' },
];

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const AddExpense = () => {
    const { showToast } = useToast();

    const sheetRef = useRef<BottomSheet>(null);

    const [showSheet, setShowSheet] = useState(false);
    const [sheetTitle, setSheetTitle] = useState('');
    const [sheetOptions, setSheetOptions] = useState<any[]>([]);
    const [displayKeys, setDisplayKeys] = useState<string[]>([]);
    const [placeholder, setPlaceholder] = useState('');

    const [sheetType, setSheetType] = useState<'category' | 'payment'>('category');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [expense, setExpense] = useState({
        title: '',
        amount: '',
        category: '',
        customCategory: '',
        paymentMethod: '',
        notes: '',
    });

    const [errors, setErrors] = useState<{
        title?: string;
        amount?: string;
        category?: string;
        expenseDate?: string;
        paymentMethod?: string;
    }>({});

    const {
        data: user,
        isLoading: userLoading,
        error: userError,
        refetch: userRefetch,
    } = useUser();

    const {
        data: business,
        isLoading: businessLoading,
        error: businessError,
        refetch: businessRefetch,
    } = useBusiness(user?.id);

    const businessId = business?.id;

    const {
        mutateAsync: addExpenseMutation,
        isPending,
    } = useAddExpense(businessId);

    const isDataLoading = userLoading || businessLoading;
    const isErrorFetching = userError || businessError;

    // Open Bottom Sheet
    const openSheet = (
        title: string,
        options: any[],
        type: 'category' | 'payment',
        keys: string[],
        searchPlaceholder: string,
    ) => {
        setSheetTitle(title);
        setSheetOptions(options);
        setSheetType(type);
        setDisplayKeys(keys);
        setPlaceholder(searchPlaceholder);

        setShowSheet(true);
        sheetRef.current?.snapToIndex(0);
    };

    // Handle Bottom Sheet Selection
    const handleSelect = (value: any) => {
        if (sheetType === 'category') {
            setExpense({
                ...expense,
                category: value.name,
                customCategory:
                    value.name === 'Custom Category'
                        ? expense.customCategory
                        : '',
            });

            setErrors({
                ...errors,
                category: undefined,
            });
        } else {
            setExpense({
                ...expense,
                paymentMethod: value.value,
            });

            setErrors({
                ...errors,
                paymentMethod: undefined,
            });
        }

        sheetRef.current?.close();
        setShowSheet(false);
    };

    // Validate Expense
    const validateExpense = () => {
        const categoryValue =
            expense.category === 'Custom Category'
                ? expense.customCategory
                : expense.category;

        const result = expenseSchema.safeParse({
            title: expense.title,
            amount: expense.amount,
            category: categoryValue,
            expenseDate: formatDate(selectedDate),
            paymentMethod: expense.paymentMethod,
            notes: expense.notes,
        });

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;

            setErrors({
                title: fieldErrors.title?.[0],
                amount: fieldErrors.amount?.[0],
                category: fieldErrors.category?.[0],
                expenseDate: fieldErrors.expenseDate?.[0],
                paymentMethod: fieldErrors.paymentMethod?.[0],
            });

            return false;
        }

        setErrors({});
        return true;
    };

    // Add Expense
    const addExpense = async () => {
        if (!validateExpense()) {
            return;
        }

        if (!businessId) {
            showToast(
                'error',
                'Business not found',
                'Unable to identify your business. Please try again.',
            );
            return;
        }

        const categoryValue =
            expense.category === 'Custom Category'
                ? expense.customCategory.trim()
                : expense.category;

        try {
            await addExpenseMutation({
                businessId,
                title: expense.title.trim(),
                amount: Number(expense.amount),
                category: categoryValue,
                expenseDate: formatDate(selectedDate),
                paymentMethod: expense.paymentMethod as
                    | 'cash'
                    | 'bank_transfer'
                    | 'card'
                    | 'other',
                notes: expense.notes.trim() || null,
            });

            showToast(
                'success',
                'Expense Added',
                'Your expense has been added successfully.',
            );

            router.back();
        } catch (error) {
            showToast(
                'error',
                'Unable to add expense',
                "We couldn't add this expense. Please try again.",
            );
        }
    };

    // Retry Loading
    const handleRetry = () => {
        userRefetch();
        businessRefetch();
    };

    // Loading State
    if (isDataLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header
                    title="Add Expense"
                    onPress={() => router.back()}
                />

                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator
                        size="large"
                        color={Colors.primary}
                    />
                </View>
            </SafeAreaView>
        );
    }

    // Error State
    if (isErrorFetching) {
        return (
            <SafeAreaView style={styles.container}>
                <Header
                    title="Add Expense"
                    onPress={() => router.back()}
                />

                <CustomEmptyComponent
                    isError={true}
                    mainText="Something Went Wrong"
                    subText="Unable to load your business data. Please try again."
                    onPress={handleRetry}
                />
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <Header
                    title="Add Expense"
                    onPress={() => router.back()}
                />

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.subHeading}>
                            Record your business expenses to keep your finances organized.
                        </Text>

                        {/* Expense Title */}
                        <Input
                            title="Expense Title*"
                            placeholder="e.g. Monthly shop rent"
                            value={expense.title}
                            onChangeText={(text: string) => {
                                setExpense({ ...expense, title: text });
                                setErrors({ ...errors, title: undefined });
                            }}
                            error={errors.title}
                        />

                        {/* Amount */}
                        <Input
                            title="Amount*"
                            placeholder="Enter amount"
                            keyboard="numeric"
                            value={expense.amount}
                            onChangeText={(text: string) => {
                                setExpense({ ...expense, amount: text });
                                setErrors({ ...errors, amount: undefined });
                            }}
                            error={errors.amount}
                        />

                        {/* Category */}
                        <SelectInput
                            title="Category*"
                            placeholder="Select Category"
                            value={expense.category}
                            iconName="apps-outline"
                            iconType="Ionicons"
                            error={errors.category}
                            onPress={() => {
                                setShowSheet(true);

                                openSheet(
                                    'Select Category',
                                    expenseCategories,
                                    'category',
                                    ['icon', 'iconType', 'name'],
                                    'Search category',
                                );
                            }}
                        />

                        {/* Custom Category */}
                        {expense.category === 'Custom Category' && (
                            <Input
                                title="Custom Category*"
                                placeholder="Enter category name"
                                value={expense.customCategory}
                                onChangeText={(text: string) => {
                                    setExpense({
                                        ...expense,
                                        customCategory: text,
                                    });

                                    setErrors({
                                        ...errors,
                                        category: undefined,
                                    });
                                }}
                                error={errors.category}
                            />
                        )}

                        {/* Expense Date */}
                        {/* Expense Date */}
                        <SelectInput
                            title="Expense Date*"
                            placeholder="Select Expense Date"
                            value={selectedDate.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })}
                            iconName="calendar-outline"
                            iconType="Ionicons"
                            error={errors.expenseDate}
                            onPress={() => setShowDatePicker(true)}
                        />

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                maximumDate={new Date()}
                                onChange={(event, date) => {
                                    setShowDatePicker(false);

                                    if (date) {
                                        setSelectedDate(date);
                                        setErrors({
                                            ...errors,
                                            expenseDate: undefined,
                                        });
                                    }
                                }}
                            />
                        )}

                        {/* Payment Method */}
                        <SelectInput
                            title="Payment Method*"
                            placeholder="Select Payment Method"
                            value={
                                paymentMethods.find(
                                    item => item.value === expense.paymentMethod,
                                )?.name || ''
                            }
                            iconName="wallet-outline"
                            iconType="Ionicons"
                            error={errors.paymentMethod}
                            onPress={() => {
                                setShowSheet(true);

                                openSheet(
                                    'Select Payment Method',
                                    paymentMethods,
                                    'payment',
                                    ['name'],
                                    'Search payment method',
                                );
                            }}
                        />

                        {/* Notes */}
                        <Input
                            title="Notes (optional)"
                            placeholder="Add any additional details"
                            value={expense.notes}
                            onChangeText={(text: string) => {
                                setExpense({ ...expense, notes: text });
                            }}
                        />

                        {/* Submit */}
                        <View style={styles.button}>
                            <Button
                                title="Add Expense"
                                onPress={addExpense}
                                isLoading={isPending}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Bottom Sheet */}
            {showSheet && (
                <CustomBottomSheet
                    bottomSheetRef={sheetRef}
                    searchable={true}
                    searchPlaceholder={placeholder}
                    displayKeys={displayKeys}
                    options={sheetOptions}
                    title={sheetTitle}
                    onSelect={handleSelect}
                />
            )}
        </View>
    );
};

export default AddExpense;
