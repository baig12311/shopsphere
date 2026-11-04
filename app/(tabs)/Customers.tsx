import { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '../../src/constants/colors';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import fonts, { fontSize } from '../../src/constants/typography';
import CustomerSkeleton from '../../src/components/skeleton/CustomerSkeleton';
import CustomerCard from '../../src/components/customers/CustomerCard';
import CustomEmptyComponent from '../../src/components/common/CustomEmptyComponent';
import { useUser } from '../../src/hooks/useUser';
import { useCustomerOrders } from '../../src/hooks/useCustomerOrders';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useCustomers } from '../../src/hooks/useCustomer';
import Header from '../../src/components/common/Header';
import Input from '../../src/components/common/Input';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import OfflineScreen from '../../src/components/common/OfflineScreen';

const Customers = () => {
    const [searchText, setSearchText] = useState('')
    const {isOffline, checkConnection} = useNetworkStatus()
    // const [orderLoading, setOrderLoading] = useState(false)
    const { data, isLoading: userLoading, error: userError, refetch: userRefetch} = useUser()
    const userId = data?.id
    const { data: business, isLoading: businessLoading, error: businessError, refetch: businessRefetch} = useBusiness(userId)
    const { data: customers, isLoading: customersLoading, error: customerError, refetch: customerRefetch} = useCustomers(business?.id)
    const isLoading = userLoading || businessLoading || customersLoading 
    const isErrorFetching = userError || businessError || customerError

     const handleRetry = async () => {
    const isConnected = await checkConnection();

    if (!isConnected) return;

    await Promise.all([
        userRefetch(),
        businessRefetch(),
        customerRefetch(),
    ]);
};

    // error
    if (isOffline && customers === undefined) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Customers' onPress={() => router.back()} />
                    <Input
                placeholder='Search customer...'
                value={searchText}
                onChangeText={setSearchText}
                iconName='search-outline'
                iconType='Ionicons'
            />
                <OfflineScreen onPress={handleRetry}/>

            </SafeAreaView>
        )
    }
    // search customer
    const filterCustomers = customers?.filter(item =>
        item.name.toLowerCase().
            includes(searchText.trim().toLocaleLowerCase())
    )

    // render customer
    const CustomerItem = ({ item }: any) => {
        const orders = (item.orders ?? []).filter(
        (order: any) =>
            !['cancelled', 'canceled'].includes(
                String(order.status ?? '').trim().toLowerCase()
            )
    );

    const totalPurchases = orders.reduce(
        (sum: number, order: any) =>
            sum + Number(order.total_amount ?? 0),
        0
    );

    const outstandingBalance = orders.reduce(
        (sum: number, order: any) => {
            const due =
                Number(order.total_amount ?? 0) -
                Number(order.paid_amount ?? 0);

            return sum + Math.max(0, due);
        },
        0
    );

        return (
            <CustomerCard
                name={item.name}
                phone={item.phone}
                order={orders?.length ?? 0}
                balance={outstandingBalance}
                currency = {business?.currency}
                totalPurchase={totalPurchases}
                onPress={() =>
                    router.push({
                        pathname: '/customerDetail/[Customer]',
                        params: {
                            customerId: item.id,
                        },
                    })
                }
            />
        );
    };
    const renderCustomer = ({ item }: any) => {
        return <CustomerItem item={item} />;
    };

    if(isLoading)
        return(
    
        <SafeAreaView style={styles.container}>
            <Header title='Customers' 
            onPress={() => router.back()} />
            <Input
                placeholder='Search customer...'
                value={searchText}
                onChangeText={setSearchText}
                iconName='search-outline'
                iconType='Ionicons'
            />
            <CustomerSkeleton/>
        </SafeAreaView>
        )

    // error
    if (isErrorFetching && !isOffline && !customers) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Customers' onPress={() => router.back()} />
                    <Input
                placeholder='Search customer...'
                value={searchText}
                onChangeText={setSearchText}
                iconName='search-outline'
                iconType='Ionicons'
            />
                <CustomEmptyComponent 
                isError={true}
                mainText='Something Went Wrong'
                subText='Unable to load customers. Please try again.'
                onPress={handleRetry}
                />

            </SafeAreaView>
        )
    }

    
    return (
        <SafeAreaView style={styles.container}>
            <Header title='Customers' onPress={() => router.back()} />
            <Input
                placeholder='Search customer...'
                value={searchText}
                onChangeText={setSearchText}
                iconName='search-outline'
                iconType='Ionicons'
            />
            {
                isLoading ? <CustomerSkeleton /> : (
                    <FlatList
                        contentContainerStyle={{ flexGrow: 1, marginBottom: hp(6) }}
                        data={filterCustomers ?? []}
                        renderItem={renderCustomer}
                        keyExtractor={(item: any) => item.id}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        ListEmptyComponent={
                            searchText.trim() !== '' ? (
                                <CustomEmptyComponent
                                    mainText='No Matching Customers'
                                    subText="We couldn't find any customers matching your search. Try a different keyword."
                                />
                            ) : (
                                <CustomEmptyComponent
                                    illustration={require('../../assets/illustrations/nocustomer.png')}
                                    mainText='No Customers Yet'
                                    subText='Your customers will appear here as you start adding them or recording their orders.'
                                />
                            )
                        }
                    />
                )
            }

        </SafeAreaView>

    );
};


const styles = StyleSheet.create({
    container: {
        padding: wp(3),
        backgroundColor: Colors.background,
        flex: 1
    },
});

//make this component available to the app
export default Customers;
