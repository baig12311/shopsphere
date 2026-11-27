// import { View, Text, TouchableOpacity} from 'react-native';
// import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { router } from 'expo-router';
// import styles from './ExpenseStyle';
// import Header from '../../src/components/common/Header';
// import Icon from '../../src/components/common/Icon';
// import Colors from '../../src/constants/colors';
// const Expense = () => {
//     return (
//         <SafeAreaView style={styles.container}>
//             <TouchableOpacity 
//             activeOpacity={0.7}
//             style={styles.floatingButton}
//             onPress={()=>router.push('addExpense/AddExpense')}
//             >
//                 <Icon
//                 name='plus'
//                 type='Entypo'
//                 color={Colors.surface}
//                 size={wp(6)}
//                 />
//             </TouchableOpacity>
//             <Header title='Expenses' onPress={() => router.back()} />

//         </SafeAreaView>
//     );
// };

// export default Expense;





// expense screen from GPT


import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import styles from './ExpenseStyle';
import Header from '../../src/components/common/Header';
import Icon from '../../src/components/common/Icon';
import Colors from '../../src/constants/colors';

import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useExpenses } from '../../src/hooks/useExpense';

const Expense = () => {
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
        data: expenses = [],
        isLoading: expensesLoading,
        error: expensesError,
        refetch: expensesRefetch,
    } = useExpenses(businessId ?? '');

    const isLoading = userLoading || businessLoading || (!!businessId && expensesLoading);

    const totalExpenses = expenses.reduce(
        (total, expense) => total + Number(expense.amount || 0),
        0
    );

    const formatAmount = (amount: number) =>
        `Rs. ${amount.toLocaleString('en-PK', {
            maximumFractionDigits: 2,
        })}`;

    const formatDate = (date: string) => {
        const parsedDate = new Date(`${date}T00:00:00`);

        return parsedDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleRetry = () => {
        if (userError) {
            userRefetch();
            return;
        }

        if (businessError) {
            businessRefetch();
            return;
        }

        expensesRefetch();
    };

    const error = userError || businessError || expensesError;

    const renderExpense = ({ item }: { item: typeof expenses[number] }) => (
        <View style={styles.expenseItem}>
            <View style={styles.expenseIcon}>
                <Icon
                    name="receipt-outline"
                    type="Ionicons"
                    color={Colors.primary}
                    size={wp(5.5)}
                />
            </View>

            <View style={styles.expenseDetails}>
                <Text style={styles.expenseTitle} numberOfLines={1}>
                    {item.title}
                </Text>

                <Text style={styles.expenseMeta} numberOfLines={1}>
                    {item.category} · {formatDate(item.expense_date)}
                </Text>
            </View>

            <Text style={styles.expenseAmount}>
                - {formatAmount(Number(item.amount))}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Expenses"
                onPress={() => router.back()}
            />

            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.floatingButton}
                onPress={() => router.push('addExpense/AddExpense')}
            >
                <Icon
                    name="plus"
                    type="Entypo"
                    color={Colors.surface}
                    size={wp(6)}
                />
            </TouchableOpacity>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.messageText}>Loading expenses...</Text>
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Icon
                        name="cloud-offline-outline"
                        type="Ionicons"
                        color={Colors.primary}
                        size={wp(12)}
                    />

                    <Text style={styles.stateTitle}>
                        Unable to Load Expenses
                    </Text>

                    <Text style={styles.messageText}>
                        Please check your connection and try again.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.retryButton}
                        onPress={handleRetry}
                    >
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={expenses}
                    keyExtractor={(item) => item.id}
                    renderItem={renderExpense}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>
                                    Total Expenses
                                </Text>

                                <Text style={styles.summaryAmount}>
                                    {formatAmount(totalExpenses)}
                                </Text>

                                <Text style={styles.summaryDescription}>
                                    All recorded expenses
                                </Text>
                            </View>

                            <Text style={styles.sectionTitle}>
                                Recent Expenses
                            </Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Icon
                                    name="receipt-outline"
                                    type="Ionicons"
                                    color={Colors.primary}
                                    size={wp(10)}
                                />
                            </View>

                            <Text style={styles.stateTitle}>
                                No Expenses Yet
                            </Text>

                            <Text style={styles.messageText}>
                                Your recorded expenses will appear here.
                                Add your first expense to get started.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default Expense;

