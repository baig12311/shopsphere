import { useState, useCallback} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '../../src/constants/colors';
import { useUser } from '../../src/hooks/useUser';
import { LineChart } from 'react-native-gifted-charts'
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { Color, router , useFocusEffect} from 'expo-router';
import fonts, { fontSize } from '../../src/constants/typography';
import Header from '../../src/components/home/Header';
import LowStockCard from '../../src/components/home/LowStockCard';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useCustomers } from '../../src/hooks/useCustomer';
import RecentOrder from '../../src/components/home/RecentOrder';
import { currencies } from '../../src/services/data/currencies';
import Icon from '../../src/components/common/Icon';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import OfflineScreen from '../../src/components/common/OfflineScreen';
import { formatAmount } from '../../src/utils/formatAmount';
import { quickActions } from '../../src/services/data/quickActions';
import { useProducts } from '../../src/hooks/useProducts';
import { useOrders } from '../../src/hooks/useOrders';
import ActionCard from '../../src/components/home/ActionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardSkeleton from '../../src/components/skeleton/HomeSkeleton';
import DashboardCard from '../../src/components/home/DashboardCard';
import CustomEmptyComponent from '../../src/components/common/CustomEmptyComponent';

const Home = () => {
    const {isOffline, checkConnection} = useNetworkStatus()
    const [showSelector, setShowSelector] = useState(false)
    useFocusEffect(
    useCallback(() => {
        setShowSelector(false);
    }, [])
);
    const [salesPeriod, setSalesPeriod] = useState<'Today' | 'Yesterday' | 'Week' | 'Month'>('Today');
    const { data, error, isLoading: userLoading, error: userError, refetch: userRefetch} = useUser()

    const userId = data?.id
    const { data: business, error: bError, isLoading: bLoading, refetch:bRefetch} = useBusiness(userId)

    const userName = data?.user_metadata?.name || 'User'
    const { data: orders, isLoading: orderLoading, error: orderError, refetch: orderRefetch} = useOrders(business?.id)
    const { data: products, isLoading: productLoading, error: productError, refetch: productRefetch} = useProducts(business?.id)
    const { data: customers, isLoading: customerLoading, error: customerError, refetch: customerRefetch} = useCustomers(business?.id)

    const isLoading = userLoading || bLoading || orderLoading
        || productLoading || customerLoading

        const isErrorFetching = userError || bError || orderError || productError || customerError

         const handleRetry = async () => {
    const isConnected = await checkConnection();

    if (!isConnected) return;

    await Promise.all([
        userRefetch(),
        bRefetch(),
        orderRefetch(),
        productRefetch(),
        customerRefetch(),
    ]);
};

        // network

         if (isOffline) {
        return (
            <SafeAreaView style={styles.container}>
                <Header
                userName={userName}
                business={business?.name || ''}
                imageurl={business?.logo_url}
            />
                    
                <OfflineScreen onPress={handleRetry}/>

            </SafeAreaView>
        )
    }
    // Filter out cancelled orders
    const activeOrders = (orders ?? []).filter(
        order =>
            !['cancelled', 'canceled'].includes(
                String(order.status ?? '').trim().toLowerCase()
            )
    );

    // filter products low stock
    const lowStockProducts = products?.filter(
        product => product.stock_quantity <= product.low_stock_threshold
    ) ?? []

    // filter order by period
    const filteredOrders = activeOrders.filter(order => {
        const date = new Date(order.created_at);
        const now = new Date();

        if (salesPeriod === 'Today') {
            return (
                date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
        }

        if (salesPeriod === 'Yesterday') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);

            return (
                date.getDate() === yesterday.getDate() &&
                date.getMonth() === yesterday.getMonth() &&
                date.getFullYear() === yesterday.getFullYear()
            );
        }

        if (salesPeriod === 'Week') {
            const startOfWeek = new Date(now);
            const day = now.getDay();
            const diff = day === 0 ? 6 : day - 1;

            startOfWeek.setDate(now.getDate() - diff);
            startOfWeek.setHours(0, 0, 0, 0);

            return date >= startOfWeek;
        }

        if (salesPeriod === 'Month') {
            return (
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
        }

        return false;
    }) ?? [];

    // new chart data
    const chartData = (() => {

        if (salesPeriod === 'Today' || salesPeriod === 'Yesterday') {

            const timeSlots = [
                { start: 0, end: 4, label: '12AM' },
                { start: 4, end: 8, label: '4AM' },
                { start: 8, end: 12, label: '8AM' },
                { start: 12, end: 16, label: '12PM' },
                { start: 16, end: 20, label: '4PM' },
                { start: 20, end: 24, label: '8PM' },
            ];

            return timeSlots.map(slot => {
                const sales = filteredOrders
                    .filter(order => {
                        const date = new Date(order.created_at);
                        const hour = date.getHours();

                        return hour >= slot.start && hour < slot.end;
                    })
                    .reduce(
                        (sum, order) => sum + Number(order.total_amount),
                        0
                    );

                return {
                    value: sales,
                    label: slot.label,
                };
            });
        }

        if (salesPeriod === 'Week') {
            const now = new Date();
            const currentDay = now.getDay();
            const diff = currentDay === 0 ? -6 : 1 - currentDay;

            return Array.from({ length: 7 }, (_, index) => {
                const date = new Date(now);
                date.setDate(now.getDate() + diff + index);
                date.setHours(0, 0, 0, 0);

                const sales = filteredOrders
                    .filter(order => {
                        const orderDate = new Date(order.created_at);

                        return (
                            orderDate.getFullYear() === date.getFullYear() &&
                            orderDate.getMonth() === date.getMonth() &&
                            orderDate.getDate() === date.getDate()
                        );
                    })
                    .reduce(
                        (sum, order) => sum + Number(order.total_amount),
                        0
                    );

                return {
                    value: sales,
                    label: date.toLocaleDateString('en-US', {
                        weekday: 'short',
                    }),
                };
            });
        }

        if (salesPeriod === 'Month') {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();

            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const weeks = [];

            for (let startDay = 1; startDay <= daysInMonth; startDay += 7) {
                const endDay = Math.min(startDay + 6, daysInMonth);

                const sales = filteredOrders
                    .filter(order => {
                        const date = new Date(order.created_at);

                        return (
                            date.getFullYear() === year &&
                            date.getMonth() === month &&
                            date.getDate() >= startDay &&
                            date.getDate() <= endDay
                        );
                    })
                    .reduce(
                        (sum, order) => sum + Number(order.total_amount),
                        0
                    );

                weeks.push({
                    value: sales,
                    label: `${startDay}-${endDay}`,
                });
            }

            return weeks;
        }

        return [];
    })();

    // get week range
    const getWeekRange = () => {
        const now = new Date();

        const start = new Date(now);
        const day = now.getDay();
        const diff = day === 0 ? -6 : 1 - day;

        start.setDate(now.getDate() + diff);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
        };

        return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
    };

    // sales
    const totalSales = filteredOrders.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <DashboardSkeleton />
            </SafeAreaView>
        )
    }

    if (isErrorFetching) {
        return (
            <SafeAreaView style={styles.container}>
                <Header
                userName={userName}
                business={business?.name || ''}
                imageurl={business?.logo_url}
            />
                    
                <CustomEmptyComponent 
                isError={true}
                mainText='Something Went Wrong'
                subText='Unable to load data. Please try again.'
                onPress={handleRetry}
                />

            </SafeAreaView>
        )
    }


    return (
        <SafeAreaView style={styles.container}>

            <Header
                userName={userName}
                business={business?.name}
                imageurl={business?.logo_url}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.selector}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.timeSelector}
                        onPress={() => setShowSelector(!showSelector)}
                    >

                        <Icon
                            name='calendar-outline'
                            type='Ionicons'
                            size={wp(4)}
                            color={Colors.textSecondary}
                        />

                        <Text style={styles.timeText}>
                            {salesPeriod === 'Week'
                                ? `This Week · ${getWeekRange()}`
                                : salesPeriod === 'Month'
                                    ? 'This Month'
                                    : salesPeriod}
                        </Text>

                        <Icon
                            name='chevron-small-down'
                            type='Entypo'
                            size={wp(5)}
                            color={Colors.textSecondary}
                        />

                    </TouchableOpacity>
                    {
                        showSelector && (
                            <View style={styles.selectorMenu}>
                                <Text style={styles.period}
                                    onPress={() => { setSalesPeriod('Today'), setShowSelector(false) }}
                                >Today</Text>
                                <Text style={styles.period}
                                    onPress={() => { setSalesPeriod('Yesterday'), setShowSelector(false) }}
                                >Yesterday</Text>
                                <Text style={styles.period}
                                    onPress={() => { setSalesPeriod('Week'), setShowSelector(false) }}
                                >This Week</Text>
                                <Text style={styles.period}
                                    onPress={() => { setSalesPeriod('Month'), setShowSelector(false) }}
                                >This Month</Text>
                            </View>
                        )
                    }
                </View>

                <View style={styles.infoContainer}>

                    <DashboardCard
                        title="Products"
                        info={products?.length}
                        iconName='cube'
                        iconType='Ionicons'
                        bgColor={Colors.blueExtraLight}
                        iconColor={Colors.blue}
                        iconBg={Colors.blueLight}
                    />

                    <DashboardCard
                        title="Customers"
                        info={customers?.length}
                        iconName='people'
                        iconType='Ionicons'
                        bgColor={Colors.purpleExtraLight}
                        iconColor={Colors.purple}
                        iconBg={Colors.purpleLight}
                    />

                    <DashboardCard
                        title="Orders"
                        info={activeOrders.length}
                        iconName='receipt'
                        iconType='Ionicons'
                        bgColor={Colors.yellowExtraLight}
                        iconColor={Colors.yellow}
                        iconBg={Colors.yellowLight}
                    />

                    <DashboardCard
                        title={salesPeriod === 'Today' ? "Today's Sale" : salesPeriod === 'Yesterday' ? "Yesterday Sales"
                            : salesPeriod === 'Week' ? 'This Week Sales' : 'This Month Sales'
                        }
                        info={formatAmount(totalSales)}
                        iconName='cash'
                        iconType='Ionicons'
                        bgColor={Colors.succesExtraLight}
                        //iconColor='#16A34A'
                        iconColor={Colors.primary}
                        iconBg='#E8F0EA'
                        currency={business?.currency}
                    />

                </View>

                {/* quic action buttons */}
                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <View style={styles.actionRow}>
                        {
                            quickActions.map((action, index) => (
                                <ActionCard
                                    key={index}
                                    iconName={action.name}
                                    iconType={action.type}
                                    title={action.title}
                                    onPress={action.onPress}
                                />
                            ))
                        }
                    </View>

                </View>

                {/* sales overview chart */}
                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        Sales Overview{' '}
                        <Text style={styles.currency}>
                            ({business?.currency})
                        </Text>
                    </Text>

                    <View style={styles.chartContainer}>
                        {
                            activeOrders.length > 0 && (
                                <Text style={styles.textSwipe}>Scroll to Left</Text>
                            )
                        }

                        {
                            totalSales ? (
                                <LineChart
                                    data={chartData}
                                    height={hp(22)}
                                    thickness={1.5}
                                    hideDataPoints={false}
                                    //curved
                                    color={Colors.primary}
                                    xAxisColor={Colors.border}
                                    yAxisColor={Colors.border}
                                    startFillColor1={Colors.primary}
                                    endFillColor1={Colors.primaryLight}
                                    dataPointsColor={Colors.primaryDark}
                                    startOpacity={0.5}
                                    endOpacity={0.1}
                                    hideRules
                                    isAnimated={true}
                                    noOfSections={4}
                                    // spacing={
                                    //     salesPeriod === 'Month'
                                    //         ? wp(5)
                                    //         : salesPeriod === 'Week'
                                    //             ? wp(10)
                                    //             : wp(12)
                                    // }
                                    spacing={wp(15)}
                                    areaChart
                                    yAxisLabelWidth={wp(15)}
                                    xAxisLabelTextStyle={styles.axisLabelText}
                                    yAxisTextStyle={styles.axisLabelText}
                                    formatYLabel={(label) => formatAmount(Number(label))}
                                />
                            ) : (
                                <Text style={styles.txtNo}>No sales data to show</Text>
                            )
                        }

                    </View>

                </View>

                {/* recent order */}
                {
                    activeOrders.length > 0 && (
                        <View style={styles.lowContainer}>
                            <Text style={styles.sectionTitle}>Recent Sale</Text>
                            <View style={styles.productContainer}>
                                {
                                    activeOrders.slice(0, 3).map((item: any, index) => {
                                        const customer = item?.customer?.name
                                        return (
                                            <RecentOrder
                                                key={index}
                                                cName={customer}
                                                amount={item.total_amount.toLocaleString()}
                                                currency={business?.currency}
                                                order={item.order_number}
                                                onPress={() => router.push({
                                                    pathname: 'orderDetail/[order]',
                                                    params: {
                                                        orderId: item.id
                                                    }
                                                })}
                                            />
                                        )
                                    })
                                }
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.viewButton}
                                    onPress={() => router.replace('Orders')}
                                >
                                    <Text style={styles.viewInvent}>View Orders</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    )
                }

                {/* low stock products */}
                {
                    lowStockProducts && lowStockProducts.length > 0 && (
                        <View style={styles.lowContainer}>
                            <Text style={styles.sectionTitle}>Low Stock</Text>
                            <Text style={styles.attention}>{lowStockProducts.length} products needs attention</Text>
                            <View style={styles.productContainer}>
                                {
                                    lowStockProducts.slice(0, 3).map((item, index) => (
                                        <LowStockCard
                                            key={index}
                                            imageurl={item.image_url}
                                            stock={item.stock_quantity}
                                            title={item.name}
                                            onPress={() => router.push({
                                                pathname: 'stock/[product]',
                                                params: {
                                                    productId: item.id
                                                }
                                            })}
                                        />
                                    ))
                                }
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.viewButton}
                                    onPress={() => router.push('/inventory/Inventory')}
                                >
                                    <Text style={styles.viewInvent}>View Inventory</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    )
                }

            </ScrollView>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        padding: wp(3),
        flex: 1
    },

    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    section: {
        marginBottom: hp(2)
    },

    sectionTitle: {
        fontFamily: fonts.bold,
        fontSize: fontSize.subHeading,
        marginBottom: hp(1),
        color: Colors.text
    },

    infoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: hp(2)
    },
    selector: {
        alignItems: 'flex-end',
        marginBottom: hp(2)
    },
    selectorMenu: {
        backgroundColor: Colors.surface,
        padding: wp(3),
        position: 'absolute',
        zIndex: 999,
        top: 27,
        borderRadius: wp(2),
        elevation: 1

    },
    period: {
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color: Colors.textSecondary,
        paddingVertical: hp(0.5)
    },
    timeSelector: {
        borderWidth: 0.5,
        borderRadius: wp(2),
        //alignSelf: 'flex-end',
        padding: wp(2),
        borderColor: Colors.textMuted,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        elevation: 1,
        zIndex: 999999
        //marginBottom: hp(2)
    },

    timeText: {
        fontFamily: fonts.regular,
        fontSize: fontSize.smallText,
        color: Colors.textSecondary,
        marginHorizontal: wp(2),
    },

    scrollContainer: {
        paddingBottom: hp(4),
        paddingTop: hp(0.5),
        flexGrow: 1
    },

    axisLabelText: {
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color: Colors.textSecondary
    },

    chartContainer: {
        backgroundColor: Colors.surface,
        elevation: 1,
        borderRadius: wp(2),
        paddingVertical: hp(2)
    },
    txtNo: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize.text,
        color: Colors.textSecondary,
        paddingVertical: hp(2),
        textAlign: 'center'
    },
    lowContainer: {
        backgroundColor: Colors.surface,
        elevation: 1,
        borderRadius: wp(2),
        marginBottom: hp(2),
        padding: wp(2)
    },
    attention: {
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color: Colors.textSecondary,
        marginBottom: hp(2)
    },
    productContainer: {
        borderRadius: wp(2),
        padding: wp(2),
        borderWidth: 0.3,
        borderColor: Colors.textSecondary,
        marginBottom: hp(1)
    },
    viewButton: {
        paddingVertical: hp(1),
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    viewInvent: {
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color: Colors.primary
    },
    textSwipe: {
        fontFamily: fonts.medium,
        fontSize: fontSize.extraSmallText,
        color: Colors.textSecondary,
        textAlign: 'right',
        marginRight: wp(2)
    },
    currency: {
        fontSize: fontSize.smallText,
        fontFamily: fonts.medium,
        color: Colors.textSecondary
    },
});

export default Home;
