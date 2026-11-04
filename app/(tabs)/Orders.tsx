import { useState, useCallback} from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect} from 'expo-router';
import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useOrders } from '../../src/hooks/useOrders';
import OrderSkeleton from '../../src/components/skeleton/OrderSkeleton';
import Header from '../../src/components/common/Header';
import CustomEmptyComponent from '../../src/components/common/CustomEmptyComponent';
import CustomerOrderCard from '../../src/components/customers/CustomerOrderCard';
import Input from '../../src/components/common/Input';
import OnlineOrderCard from '../../src/components/sales/OnlineOrderCard';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { formatDate } from '../../src/services/formatDate';
import Colors from '../../src/constants/colors';
import { orderStatus } from '../../src/services/data/orderStatus';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import OfflineScreen from '../../src/components/common/OfflineScreen';
import { OrderSource } from '../../src/services/createOrder';
import Status from '../../src/components/sales/Status';
import OrderCard from '../../src/components/sales/OrderCard';
import OrderSourceSelector from '../../src/components/common/OrderSourceSelector';
const Orders = () => {
    const { isOffline, checkConnection } = useNetworkStatus()
    const { data, isLoading: userLoading, error: userError, refetch: userRefetch } = useUser()
    const userId = data?.id
    const { data: business, isLoading: businessLoading, error: businessError, refetch: businessRefetch } = useBusiness(userId)
    const businessId = business?.id
    const businessType = business?.business_type
    const { data: orders, isLoading: ordersLoading, error: ordersError, refetch: ordersRefetch } = useOrders(businessId)
    const [selectedStatus, setSelectedStatus] = useState('All')
    const isLoading = userLoading || businessLoading || ordersLoading
    const [searchText, setSearchText] = useState('')
    const [selectedSource, setSelectedSource] = useState<
        'all' | 'online' | 'physical'
    >('all');
    useFocusEffect(
    useCallback(() => {
        setSearchText('');
        setSelectedSource('all');
        setSelectedStatus('All');
    }, [])
);
    const isErrorFetching = userError || businessError || ordersError
    // filter orders
    // const filterOrders = orders?.filter(item =>
    //     item.order_number.toString().
    //         includes(searchText.trim().toLocaleLowerCase())
    // )

    // handleRetry

    const handleRetry = async () => {
        const isConnected = await checkConnection();

        if (!isConnected) return;

        await Promise.all([
            userRefetch(),
            businessRefetch(),
            ordersRefetch(),
        ]);
    };
    if (isOffline && orders === undefined) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Orders' onPress={() => router.back()} />
                <Input
                    placeholder='Search order by number...'
                    value={searchText}
                    onChangeText={setSearchText}
                    iconName='search-outline'
                    iconType='Ionicons'
                />
                <OfflineScreen onPress={handleRetry} />

            </SafeAreaView>
        )
    }


    const filterOrders = orders?.filter(item => {
        const matchesSearch = item.order_number
            .toString()
            .includes(searchText.trim());

        const matchesSource =
            businessType !== 'both' ||
            selectedSource === 'all' ||
            item?.order_source === selectedSource;

        const matchesStatus =
            businessType !== 'online' &&
                !(businessType === 'both' && selectedSource === 'online')
                ? true
                : selectedStatus === 'All' ||
                item.status === selectedStatus;

        return matchesSearch && matchesSource && matchesStatus;
    });

    const hasActiveFilter =
        searchText.trim() !== '' ||
        selectedSource !== 'all' ||
        selectedStatus !== 'All';
    // render order
    const renderOrder = ({ item }: any) => {
        const date = formatDate(item?.created_at)
        if (item.order_source === 'online') {
            return (
                <OnlineOrderCard
                    orderNumber={item.order_number}
                    customer={item.customer?.name}
                    date={date}
                    status={item.status}
                    amount={item.total_amount}
                    paidAmount={item.paid_amount}
                    currency={business?.currency}
                    orderSource={businessType === 'both' && item?.order_source}
                    onPress={() => router.push({
                        pathname: '/orderDetail/[order]',
                        params: {
                            orderId: item.id
                        }
                    })}
                />
            )
        }
        if (item.order_source === 'physical') {
            return (
                <CustomerOrderCard
                    orderNumber={item.order_number}
                    customer={item.customer?.name}
                    date={date}
                    amount={item.total_amount}
                    paidAmount={item.paid_amount}
                    currency={business?.currency}
                    orderSource={businessType === 'both' && item?.order_source}
                    onPress={() => router.push({
                        pathname: '/orderDetail/[order]',
                        params: {
                            orderId: item.id
                        }
                    })}
                />
            )
        }
        return null

    }



    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Orders' onPress={() => router.back()} />
                <Input
                    placeholder='Search order by number...'
                    value={searchText}
                    onChangeText={setSearchText}
                    iconName='search-outline'
                    iconType='Ionicons'
                    keyboard='numeric'
                />
                <OrderSkeleton />
            </SafeAreaView>
        )
    }

    // error
    if (isErrorFetching && !isOffline && !orders) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Orders' onPress={() => router.back()} />
                <Input
                    placeholder='Search order by number...'
                    value={searchText}
                    onChangeText={setSearchText}
                    iconName='search-outline'
                    iconType='Ionicons'
                />
                <CustomEmptyComponent
                    isError={true}
                    mainText='Something Went Wrong'
                    subText='Unable to load orders. Please try again.'
                    onPress={handleRetry}
                />

            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView style={styles.container}>
            <Header title='Orders' onPress={() => router.back()} />
            <Input
                placeholder='Search order by number...'
                value={searchText}
                onChangeText={setSearchText}
                iconName='search-outline'
                iconType='Ionicons'
                keyboard='numeric'
            />
            {
                businessType === 'both' && (
                    <OrderSourceSelector
                        onSelect={(value) => setSelectedSource(value)}
                        value={selectedSource}
                        viewOrder={true}
                    />
                )
            }
            {
                (businessType === 'online' ||
                    (businessType === 'both' && selectedSource === 'online')) && (
                    <View style={styles.statusContainer}>
                        {
                            orderStatus.map((status, index) => {
                                const selected = selectedStatus === status
                                return (
                                    <Status
                                        key={index}
                                        title={status}
                                        isSelected={selected}
                                        onPress={() => setSelectedStatus(status)}
                                    />
                                )
                            })
                        }
                    </View>
                )
            }

            <FlatList
                data={filterOrders ?? []}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                contentContainerStyle={{ flexGrow: 1, paddingBottom: hp(6) }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
    <CustomEmptyComponent
        illustration={
            !hasActiveFilter
                ? require('../../assets/illustrations/noproduct.png')
                : undefined
        }
        mainText={
            hasActiveFilter
                ? 'No Matching Orders'
                : 'No Orders Yet'
        }
        subText={
            hasActiveFilter
                ? 'No orders match your current search or filters. Try adjusting them.'
                : 'Your orders and sales will appear here once you start creating them.'
        }
    />
}
            />





        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(3),
        backgroundColor: Colors.background,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(2)
    }
});

//make this component available to the app
export default Orders;
