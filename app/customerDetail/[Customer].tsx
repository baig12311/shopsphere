import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Alert, Platform} from 'react-native';
import styles from './CustomerStyle';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useCustomerById } from '../../src/hooks/useCustomer';
import { useCustomerOrders } from '../../src/hooks/useCustomerOrders';
import { useCustomerPayments } from '../../src/hooks/useCustomerPayment';
import CustomerDetailSkeleton from '../../src/components/skeleton/CustomerDetailSkeleton';
import Header from '../../src/components/common/Header';
import Row from '../../src/components/customers/Row';
import OnlineOrderCard from '../../src/components/sales/OnlineOrderCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardCard from '../../src/components/home/DashboardCard';
import { useToast } from '../../src/context/ToastContext';
import CustomerOrderCard from '../../src/components/customers/CustomerOrderCard';
import Icon from '../../src/components/common/Icon';
import PaymentModal from '../../src/components/customers/PaymentModal';
import Colors from '../../src/constants/colors';
import PaymentCard from '../../src/components/customers/PaymentCard';
import { formatAmount } from '../../src/utils/formatAmount';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import PendingCard from '../../src/components/customers/PendingCard';
import { formatDate } from '../../src/services/formatDate';
import { useReceiveCustomerPayment } from '../../src/hooks/useReceiveCustmerPayment';
import { FlatList } from 'react-native-gesture-handler';
import ActionButton from '../../src/components/customers/ActionButton';
import CustomEmptyComponent from '../../src/components/common/CustomEmptyComponent';
const CustomerDetail = () => {
    const {showToast} = useToast()
    const [showMenu, setShowMenu] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [previousDue, setPreviousDue] = useState(0);
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [newBalance, setNewBalance] = useState(0);
    const [inputError, setInputError] = useState('')
    const { customerId } = useLocalSearchParams<{ customerId: string }>()
    const [rePaid, setRePaid] = useState('')
    const [showModal, setShowModal] = useState(false)
    const { data: userData, isLoading: userLoading, error: userError, refetch: userRefetch} = useUser();
    const { data: businessData, isLoading: businessLoading, error: businessError, refetch: businessRefetch} = useBusiness(userData?.id)
    const { data: customer, isLoading: customerLoading, error: customerError, refetch: customerRefetch} = useCustomerById(customerId)
    const { data: customerOrder, isLoading: orderLoading, error: orderError, refetch: orderRefetch} = useCustomerOrders(businessData?.id, customerId)
    const { data: customerPayment, isLoading: paymentLoading, error: paymentError, refetch: paymentRefetch} = useCustomerPayments(businessData?.id, customerId)

    const { mutateAsync: receivePaymentMutation, isPending, error } = useReceiveCustomerPayment()
    const businessType = businessData?.business_type
    const isErrorFetching = userError || businessError || customerError || orderError || paymentError
    const isLoading = userLoading || businessLoading || customerLoading || orderLoading || paymentLoading
    const handleRetry = () =>{
        userRefetch()
        businessRefetch()
        customerRefetch()
        orderRefetch()
        paymentRefetch()
    }
    
const activeCustomerOrders = (customerOrder ?? []).filter(
    (order: any) =>
        !['cancelled', 'canceled'].includes(
            String(order.status ?? '').trim().toLowerCase()
        )
);

    const totalOrdersAmount = activeCustomerOrders.reduce(
    (sum: number, order: any) =>
        sum + Number(order.total_amount ?? 0),
    0
);
    const initials = customer?.name
        ?.trim()
        .split(' ')
        .map((word: string) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // handleEdit
    const handlePressEdit = () => {
        router.push({
            pathname: '/addCustomer/AddCustomer',
            params: {
                customerId: customer?.id
            }
        })
        setShowMenu(false)
    }

    // values
   const totalPurchases = activeCustomerOrders.reduce(
    (sum: number, order: any) =>
        sum + Number(order.total_amount ?? 0),
    0
);

    const outstandingBalance = activeCustomerOrders.reduce(
    (sum: number, order: any) => {
        const due =
            Number(order.total_amount ?? 0) -
            Number(order.paid_amount ?? 0);

        return sum + Math.max(0, due);
    },
    0
);

    // receive Payment 
    const handleReceivePayment = async () => {
        const amount = Number(rePaid);

        if (!rePaid.trim() || !Number.isFinite(amount) || amount <= 0) {
            setInputError('Please enter a valid payment amount.');
            return;
        }

        if (!Number.isInteger(amount * 100)) {
            setInputError('Enter an amount with at most 2 decimal places.');
            return;
        }

        if (amount > (outstandingBalance ?? 0)) {
            setInputError(
                'Payment cannot exceed the customer’s outstanding balance.'
            );
            return;
        }

        // if (!businessData?.id || !customer?.id) {
        //     setInputError('Business or customer details are unavailable.');
        //     return;
        // }

        try {
            const currentDue = outstandingBalance ?? 0;
            await receivePaymentMutation({
                businessId: businessData.id,
                customerId: customer.id,
                amount,
            });
            setPreviousDue(currentDue ?? 0);
            setReceivedAmount(amount);
            setNewBalance(currentDue - amount);
            //setShowModal(false);
            setShowSuccess(true)
            setRePaid('');

            //Alert.alert('Payment Recorded', 'Customer payment has been recorded successfully.');
        } catch (error) {
                    setShowModal(false)
                    showToast(
                        'error',
                        'Payment Failed',
                        'Unable to record payment. Please try again.'
                    )


            //Alert.alert('Payment Failed', message);
        }
    };

    
const handleCall = async () => {
    const phone = customer?.phone?.trim();

    if (!phone) {
        Alert.alert('Phone Number Missing', 'This customer has no phone number saved.');
        return;
    }

    const phoneUrl = `tel:${phone.replace(/[^\d+]/g, '')}`;

    try {
        const supported = await Linking.canOpenURL(phoneUrl);

        if (!supported) {
            Alert.alert('Unable to Call', 'Calling is not supported on this device.');
            return;
        }

        await Linking.openURL(phoneUrl);
    } catch {
        Alert.alert('Error', 'Unable to open the phone dialer.');
    }
};

const handleWhatsApp = async () => {
    const phone = customer?.phone?.trim();

    if (!phone) {
        Alert.alert('Phone Number Missing', 'This customer has no phone number saved.');
        return;
    }

    // WhatsApp expects an international number without +, spaces or dashes.
    // Example: +92 300 1234567 -> 923001234567
    const phoneNumber = phone.replace(/\D/g, '');

    if (!phoneNumber) {
        Alert.alert('Invalid Phone Number', 'Please update this customer’s phone number.');
        return;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}`;

    try {
        await Linking.openURL(whatsappUrl);
    } catch {
        Alert.alert('Unable to Open WhatsApp', 'Please check whether a browser is available on your device.');
    }
};


    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Customer Detail'
                    isMenu={true}
                    onPressMenu={() => setShowMenu(!showMenu)}
                    onPress={() => router.back()} />
                <CustomerDetailSkeleton />

            </SafeAreaView>
        )
    }
    if (isErrorFetching) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Customer Detail'
                    isMenu={true}
                    onPressMenu={() => setShowMenu(!showMenu)}
                    onPress={() => router.back()} />
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
            <View>
                {
                    showModal && (
                        <PaymentModal
                            onPressCancel={() => {
                                setShowModal(false),
                                    setRePaid(''),
                                    setInputError('')
                            }}
                            value={rePaid}
                            onChangeText={(t: string) => {
                                setRePaid(t),
                                    setInputError('')
                            }}
                            name={customer?.name}
                            due={outstandingBalance ?? 0}
                            prev={previousDue}
                            amount={receivedAmount}
                            newBalance={newBalance}
                            currency={businessData?.currency}
                            onPressReceive={handleReceivePayment}
                            error={inputError}
                            loading={isPending}
                            done={showSuccess}
                            onPressDone={() => {
                                setShowModal(false),
                                    setShowSuccess(false)
                            }}
                        />
                    )
                }
                <Header title='Customer Detail'
                    isMenu={true}
                    onPressMenu={() => setShowMenu(!showMenu)}
                    onPress={() => router.back()} />
                {
                    showMenu && (
                        <View style={styles.menu}>
                            <TouchableOpacity
                                style={styles.row}
                                activeOpacity={0.7}
                                onPress={handlePressEdit}
                            >
                                <Icon
                                    name='edit'
                                    type='Feather'
                                    size={wp(5)}
                                    color={Colors.primary}
                                />
                                <Text style={[styles.rowText, { color: Colors.primary }]}>Edit Customer</Text>

                            </TouchableOpacity>

                        </View>
                    )
                }
            </View>



            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                <View style={styles.infoContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.initials}>{initials}</Text>
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.nameText}>{customer.name}</Text>
                        {customer.phone && (
                            <Row
                                iconName="call-outline"
                                iconType="Ionicons"
                                rowTitle={customer?.phone}
                            />
                        )}

                        {customer.email && (
                            <Row
                                iconName="mail-outline"
                                iconType="Ionicons"
                                rowTitle={customer?.email}
                            />
                        )}

                        {customer.address && (
                            <Row
                                iconName="location-outline"
                                iconType="Ionicons"
                                rowTitle={customer.address}
                            />
                        )}

                        {customer.city && (
                            <Row
                                iconName="location-outline"
                                iconType="Ionicons"
                                rowTitle={customer.city}
                            />
                        )}

                        <View style={styles.actionContainer}>
                    <View style={{ flex: 1 }}>
                        <ActionButton
                            text='Call'
                            iconName='call-outline'
                            onPress={handleCall}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ActionButton
                            text='Whatsapp'
                            iconName='logo-whatsapp'
                            onPress={handleWhatsApp}
                        />
                    </View>


                </View>

                    </View>
                </View>

                {/* action */}
                {/* <View style={styles.actionContainer}>
                    <View style={{ flex: 1 }}>
                        <ActionButton
                            text='Call'
                            iconName='call-outline'
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ActionButton
                            text='Whatsapp'
                            iconName='logo-whatsapp'
                        />
                    </View>


                </View> */}
                {
                    customerOrder && (customerOrder?.length > 0) ? (
                        <>
                            <View style={styles.dashboard}>
                                <DashboardCard
                                    title='Total Orders'
                                    info={customerOrder?.length}
                                    bgColor={Colors.blueExtraLight}
                                    iconColor={Colors.blue}
                                    iconBg={Colors.blueLight}
                                    iconName='receipt-outline'
                                    iconType='Ionicons'
                                />
                                <DashboardCard
                                    title='Total Purchase'
                                    currency={businessData?.currency}
                                    info={formatAmount(totalOrdersAmount)}
                                    bgColor={Colors.purpleExtraLight}
                                    iconName='cash-outline'
                                    iconType='Ionicons'
                                    iconColor={Colors.purple}
                                    iconBg={Colors.purpleLight}
                                />
                                {/* <DashboardCard
                                    title='Total Paid'
                                    currency={businessData?.currency}
                                    info={totalOrdersAmount-outstandingBalance}
                                    bgColor={Colors.succesExtraLight}
                                    iconName='cash-outline'
                                    iconType='Ionicons'
                                    iconColor={Colors.primary}
                                    iconBg={Colors.successLight}
                                /> */}
                            </View>
                            {
                                (outstandingBalance ?? 0) > 0 && (
                                    <PendingCard
                                        pending={`${businessData?.currency} ${outstandingBalance?.toLocaleString()}`}
                                        onPress={() => setShowModal(true)}
                                    />

                                )
                            }

                            <View style={styles.sectionrRow}>
                                <Text style={styles.sectionTitle}>Recent Orders</Text>
                                {
                                    customerOrder && (customerOrder.length > 3) && (
                                        <Text style={styles.textView}
                                            onPress={() => router.push({
                                                pathname: '/customerOrders/CustomerOrders',
                                                params: {

                                                    businessId: businessData?.id,
                                                    customerId: customerId
                                                }
                                            })}
                                        >View All →</Text>
                                    )
                                }

                            </View>
                            {
                                customerOrder.slice(0, 3).map((item, index) => {
                                    const date = formatDate(item?.created_at)
                                    if (item.order_source === 'online') {
                                        return (
                                            <OnlineOrderCard
                                                key={item.id}
                                                orderNumber={item.order_number}
                                                customer={item.customer?.name}
                                                date={date}
                                                status={item.status}
                                                amount={item.total_amount}
                                                paidAmount={item.paid_amount}
                                                currency={businessData?.currency}
                                                orderSource={businessType === 'both' && item?.order_source}
                                                disabled={true}
                                            />
                                        )
                                    }
                                    if (item.order_source === 'physical') {
                                        return (
                                            <CustomerOrderCard
                                                key={item.id}
                                                orderNumber={item.order_number}
                                                customer={item.customer?.name}
                                                date={date}
                                                amount={item.total_amount}
                                                paidAmount={item.paid_amount}
                                                currency={businessData?.currency}
                                                orderSource={businessType === 'both' && item?.order_source}
                                                disabled={true}
                                            />
                                        )
                                    }
                                    return null

                                })
                            }

                            <View style={styles.sectionrRow}>
                                {
                                    customerPayment && (customerPayment.length) > 0 && (
                                        <Text style={styles.sectionTitle}>Recent Payments</Text>

                                    )
                                }
                                {
                                    customerPayment && (customerPayment.length) > 3 && (
                                        <Text style={styles.textView}
                                            onPress={() => router.push({
                                                pathname: '/customerPayment/CustomerPayment',
                                                params: {

                                                    businessId: businessData?.id,
                                                    customerId: customerId
                                                }
                                            })}
                                        >View All →</Text>
                                    )
                                }

                            </View>
                            {
                                customerPayment?.slice(0, 3).map((item, index) => {
                                    return (
                                        <PaymentCard
                                            key={item.id}
                                            amount={item.amount}
                                            allocations={item.customer_payment_allocations}
                                            date={formatDate(item.created_at)}
                                            currency={businessData?.currency}
                                        />
                                    )
                                })
                            }

                        </>

                    ) : (
                        <View style={styles.new}>
                        <Text style={styles.newHead}>Customer Overview</Text>
                        <Text style={styles.newSub}>Your customer summary will appear here once their first order is created.</Text>
                    </View>
                    )
                    
                    
                    
                }


            </ScrollView>
        </SafeAreaView>
    );
};


export default CustomerDetail;
