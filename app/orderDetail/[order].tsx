import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDate } from '../../src/services/formatDate';
import Button from '../../src/components/common/Button';
import Header from '../../src/components/common/Header';
import Colors from '../../src/constants/colors';
import Icon from '../../src/components/common/Icon';
import fonts, { fontSize } from '../../src/constants/typography';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import OutlineButton from '../../src/components/common/OutlineButton';
import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useUpdateOrderStatus } from '../../src/hooks/useUpdateOrderStatus';
import OrderDetailCard from '../../src/components/orderDetail/OrderDetailCard';
import OrderItems from '../../src/components/orderDetail/OrderItems';
import PriceSummaryCard from '../../src/components/orderDetail/PriceSummary';
import OrderDetailSkeleton from '../../src/components/skeleton/OrderDetailSkeleton';
import { router } from 'expo-router';
import OrderStatusModal from '../../src/components/sales/ChangeStatusModal';
import OrderTracking from '../../src/components/sales/OrderTracking';
import { useLocalSearchParams } from 'expo-router';
import { useOrderById } from '../../src/hooks/useOrderById';
import { useToast } from '../../src/context/ToastContext';
// import { OrderStatusType } from '../../src/components/sales/ChangeStatusModal';
import styles from './orderStyle';
import ConfirmationDialog from '../../src/components/common/ConfirmationDialog';
import PriceFormat from '../../src/utils/FormatPrice';
const OrderDetail = () => {
    const {showToast} = useToast()
    const { orderId } = useLocalSearchParams<{ orderId: string }>()
    const [showModal, setShowModal] = useState(false)
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
    const { data: user, isLoading: userLoading } = useUser()
    const { data: business, isLoading: businessLoading } = useBusiness(user?.id)
    const businessType = business?.business_type
    const { data: order, isLoading } = useOrderById(orderId)

    const { mutateAsync: updateStatusMutation, isPending: updatingStatus } = useUpdateOrderStatus({
        orderId: order?.id, businessId: business?.id
    })
    const orderStatus =
        (
            (businessType === 'online' || businessType === 'both') &&
            order?.order_source === 'online'
        )
            ? order?.status
            : null;
    const orderItems = order?.order_items ?? [];
    const paidAmount = order?.paid_amount
    const total = order?.total_amount
    // const paidAmount = 850
    // const totalAmount = 900
    //const due = paidAmount-total
    //const paymentStatus = paidAmount >= total ? 'Paid' : paidAmount < total ? total - paidAmount : 0


    // Subtotal
    const subTotal = orderItems.reduce((total: any, item: any) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;

        return total + quantity * unitPrice;
    }, 0);

    // Order values
    const totalAmount = Number(order?.total_amount) || 0;
    const amountPaid = Number(order?.paid_amount) || 0;

    // Return amount
    const returnAmount = Math.max(amountPaid - totalAmount, 0);

    // Discount
    const discount = Math.max(subTotal - totalAmount, 0);

    // handle Update status
    const handleUpdateStatus = async (
        status: 'Pending' | 'Confirmed' | 'Shipped' | 'Cancelled'
    ) => {
        try {
            await updateStatusMutation(status);

            setShowModal(false);
            setShowConfirmationDialog(false)
            showToast(
                'success',
                status==='Cancelled' ? 'Order Cancelled' : 'Status Updated',
                status === 'Cancelled' ? 'Order has been cancelled.' : 
                'Order status has been updated successfully.'
            )
        } catch (error) {
            showToast(
                'error',
                status === 'Cancelled' ? 'Unable to Cancel Order' : 'Unable to Update Status',
                status === 'Cancelled' ? "We couldn't cancel order. Please try again." : 
                "We couldn't update order status. Please try again."
            )
        }
    };
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Order Detail' onPress={() => router.back()} />
                <OrderDetailSkeleton />
            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView style={styles.container}>
            <Header title='Order Detail' onPress={() => router.back()} />
            {
                showModal && (
                    <OrderStatusModal
                        modalVisible={showModal}
                        currentStatus={order?.status}
                        onPressCancel={() => setShowModal(false)}
                        onPressUpdate={handleUpdateStatus}
                        loading={updatingStatus}
                    />
                )
            }

            {
                showConfirmationDialog && (
                    <ConfirmationDialog
                        title='Cancel Order?'
                        msg={`Are your sure you want to cancel order #${order?.order_number}?`}
                        iconName='alert-circle-outline'
                        txtButton='Cancel Order'
                        txtCancel='Keep Order'
                        modalVisible={showConfirmationDialog}
                        onPressCancel={() => setShowConfirmationDialog(false)}
                        onPressDelete={() => handleUpdateStatus('Cancelled')}

                    />
                )
            }
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            >
                <Text style={styles.sectionTitle}>Order #{order.order_number}</Text>
                <OrderDetailCard
                    cName={order?.customer.name}
                    phone={order?.customer.phone}
                    orderDate={formatDate(order?.created_at)}
                    amount={order?.total_amount}
                    paidAmount={order?.paid_amount}

                    orderStatus={orderStatus}
                />
                <Text style={styles.sectionTitle}>Order Items ({order?.order_items?.length})</Text>
                <OrderItems
                    orderItem={order?.order_items}
                />
                <Text style={styles.sectionTitle}>Price Summary</Text>
                <PriceSummaryCard
                    subTotal={subTotal}
                    total={totalAmount}
                    paid={amountPaid}
                    discount={discount}
                    change={returnAmount}
                    currency={business?.currency}
                />
                {/* testing of price formatter */}

                <PriceFormat
                    price={order?.total_amount}
                    currency={business?.currency}
                    priceFont={fonts.bold}
                    priceColor={Colors.text}
                    priceFontSize={fontSize.subHeading}
                />
                {
                    orderStatus && (<>
                        <Text style={styles.sectionTitle}>Order Status</Text>
                        {
                            orderStatus !== 'Cancelled' ? (
                                <View style={styles.orderTrackcontainer}>

                                    <OrderTracking
                                        status={order?.status} />
                                    <View style={styles.statusButtonContainer}>
                                        <View style={{ flex: 1 }}>
                                            <OutlineButton
                                                title='Cancel Order'
                                                onPress={() => setShowConfirmationDialog(true)}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Button
                                                title='Change Status'
                                                onPress={() => setShowModal(true)}
                                            />
                                        </View>
                                    </View>



                                </View>
                            ) : (
                                <View style={styles.cancelContainer}>
                                    <Icon
                                        name='close-circle-outline'
                                        type='Ionicons'
                                        size={wp(5)}
                                        color={Colors.error}
                                    />
                                    <Text style={styles.cancelText}>Order Cancelled</Text>
                                </View>

                            )
                        }

                    </>


                    )

                }

            </ScrollView>
            {
                orderStatus !== 'Cancelled' && (
                    <View style={styles.buttonContainer}>
                        <Button
                            title='View Invoice'
                            onPress={() => router.push({
                                pathname: '/receipt/Receipt',
                                params: {
                                    orderId: order.id
                                }
                            })}
                        />
                    </View>
                )
            }



        </SafeAreaView>
    );
};

export default OrderDetail;


