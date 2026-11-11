import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform} from 'react-native';
import styles from './NewOrderStyle';
import Header from '../../src/components/common/Header';
import { router } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from '../../src/constants/colors';
import Icon from '../../src/components/common/Icon';
import SelectInput from '../../src/components/common/SelectInput';
import Input from '../../src/components/common/Input';
import InputRow from '../../src/components/order/InputRow';
import { useToast } from '../../src/context/ToastContext';
import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useCustomers } from '../../src/hooks/useCustomer';
import { useProducts } from '../../src/hooks/useProducts';
import { useCreateOrder } from '../../src/hooks/useCreateOrder';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import OrderSourceSelector from '../../src/components/common/OrderSourceSelector';
import CustomBottomSheet from '../../src/components/common/CustomBottomSheet';
import Button from '../../src/components/common/Button';
import ItemCard from '../../src/components/order/ItemCard';
import BottomSheet from '@gorhom/bottom-sheet';
import { OrderSource } from '../../src/services/createOrder';

const NewOrder = () => {
    const {showToast} = useToast()
    const { data: user } = useUser()
    const { data: business } = useBusiness(user?.id)
    const { data: customers } = useCustomers(business?.id)
    const { data: products } = useProducts(business?.id)
    const [emptyMessage, setEmptyMessage] = useState('')
    const [emptyTitle, setEmptyTitle] = useState('')
    const {
        mutateAsync: createOrderMutation,
        isPending,
    } = useCreateOrder(business?.id);
    
    const sheetRef = useRef<BottomSheet>(null)
    const [orderItems, setOrderItems] = useState<any>([])
    const [discount, setDiscount] = useState('')
    const [amountPaid, setAmountPaid] = useState('')
    const [displayKeys, setDisplayKeys] = useState<string[]>([])
    const [placeholder, setPlaceholder] = useState('')
    const [remainingAmount, setRemainingAmount] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [selectedCustomerData, setSelectedCustomerData] = useState<any>(null)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [showSheet, setShowSheet] = useState(false);
    const [sheetTitle, setSheetTitle] = useState('');
    const [sheetOptions, setSheetOptions] = useState<any[]>([]);
    const [sheetValue, setSheetValue] = useState('');
    const [selectedOrderSource, setSelectedOrderSource] = useState('online')
    //type OrderSource = 'online' | 'physical';

    // const [selectedOrderSource, setSelectedOrderSource] =
    //     useState<OrderSource | null>(null);

    // const orderSource: OrderSource | null =
    //     business?.business_type === 'online'
    //         ? 'online'
    //         : business?.business_type === 'physical'
    //             ? 'physical'
    //             : business?.business_type === 'both'
    //                 ? selectedOrderSource
    //                 : null;

    const subtotal = orderItems.reduce(
        (sum: any, item: any) => sum + item.price * item.quantity,
        0
    );
    const totalAmount = subtotal - Number(discount);
    const remaining = totalAmount - Number(amountPaid);
    

    // handle customer select
    const handleCustomerSelect = (selectedCustomer: any) => {
        const selectedCustomerData = customers?.find(
            item => item.id === selectedCustomer.id
        )
        if (!selectedCustomerData) return;
        setSelectedCustomerData(selectedCustomerData)

    }
    // handle product select
    const handleProductSelect = (selectedProduct: any) => {
        // const selectedProductData = products?.find(
        //     item => item.name === selectedName
        // );

        // if (!selectedProductData) return;

        const alreadyExist = orderItems?.find(
            (item: any) => item.product_id === selectedProduct?.id
        )
        if (selectedProduct.stock_quantity <= 0) {
            showToast(
                'error',
                'Out of Stock',
                'This item is out of stock. It cannot be added'
            )
            return;
        }

        if (!alreadyExist) {
            setOrderItems([
                ...orderItems,
                {
                    // ...selectedProductData,
                    // quantity: 1

                    // Supabase ke liye
                    product_id: selectedProduct.id,
                    quantity: 1,
                    unit_price: selectedProduct.price,
                    subtotal: selectedProduct.price,

                    // UI ke liye
                    name: selectedProduct.name,
                    price: selectedProduct.price,

                    image_url: selectedProduct.image_url,
                    stock_quantity: selectedProduct.stock_quantity,
                }

            ])
        }
        else {
            showToast(
                'error',
                'Duplicate Selection',
                'This item is already added to your bill.'
            )

            return;
        }

    };

    // remove item from order
    const removeItem = (itemId: string) => {
        const newList = orderItems.filter((item: any) => item.product_id !== itemId)
        setOrderItems(newList)
    }
    // Open Sheet
    const openSheet = (
        title: string,
        options: any[],
        value: any,
        displayKeys: string[],
        placeholder: string,
        empTit: string,
        empMes: string,


    ) => {
        setSheetTitle(title);
        setSheetOptions(options);
        setSheetValue(value);
        setDisplayKeys(displayKeys)
        setPlaceholder(placeholder)
        setEmptyTitle(empTit)
        setEmptyMessage(empMes)

        sheetRef.current?.snapToIndex(0);
    };


    // Select Value Handler
    const handleSelect = (value: any) => {
        if (sheetTitle === 'Select Customer') {
            setSelectedCustomer(value);
            handleCustomerSelect(value)
        }
        if (sheetTitle === 'Select Product') {
            setSelectedProduct(value);
            handleProductSelect(value)
        }
        sheetRef.current?.close();
        setShowSheet(false);
    };

    // const increaseQuantity = (productId: string) => {
    //     setOrderItems((prev: any) =>
    //         prev.map((item: any) => {
    //             if (item.product_id !== productId) return item;

                

    //             return {
    //                 ...item,
    //                 quantity: Math.min(
    //                     item.quantity + 1,
    //                     item.stock_quantity
    //                 ),
    //             };
    //         })
    //     );
    // };

    const increaseQuantity = (productId: string) => {
    const selectedItem = orderItems.find(
        (item: any) => item.product_id === productId
    );

    if (!selectedItem) return;

    if (selectedItem.quantity >= selectedItem.stock_quantity) {
        showToast(
            'error',
            'Stock Limit Reached',
            `Only ${selectedItem.stock_quantity} units available in stock.`
        );
        return;
    }

    setOrderItems((prev: any) =>
        prev.map((item: any) =>
            item.product_id === productId
                ? {
                      ...item,
                      quantity: item.quantity + 1,
                  }
                : item
        )
    );
};

    const decreaseQuantity = (productId: string) => {
        setOrderItems((prev: any) =>
            prev.map((item: any) => {
                if (item.product_id !== productId) return item;

                return {
                    ...item,
                    quantity: Math.max(item.quantity - 1, 1),
                };
            })
        );
    };

    // Creat order
    const orderSource: any =
        business?.business_type === 'online'
            ? 'online'
            : business?.business_type === 'physical'
                ? 'physical'
                : business?.business_type === 'both'
                    ? selectedOrderSource
                    : null;
    const createOrder = async () => {
        try {
            const result = await createOrderMutation({
                businessId: business.id,
                customerId: selectedCustomerData?.id ?? null,
                totalAmount,
                paidAmount: Number(amountPaid),
                items: orderItems,
                orderSource: orderSource!
            });
            
            
            showToast(
                'success',
                'Order Processed',
                'Order details have been processed successfully.'
            )
            
            router.push({
                    pathname: '/receipt/Receipt',
                    params: {
                        orderId: result,
                    }
                })
          
            setSelectedCustomer(null)
            setSelectedCustomerData(null)
            setSelectedProduct(null)
            setOrderItems([])
            setAmountPaid('')
            setDiscount('')
            

        }
        catch (error: any) {
            showToast(
                'error',
                'Unable to create order',
                'Order details could not be processed at the moment. Please try again.'
            )
        }
    }
    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                
                <Header title='Create Order' onPress={() => router.back()} />
                     <KeyboardAvoidingView
                                        style={{ flex: 1 }}
                                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    >
                                        <ScrollView
                                            contentContainerStyle={styles.scrollContainer}
                                            keyboardShouldPersistTaps="handled"
                                            showsVerticalScrollIndicator={false}
                                        >
                

                    {/* select order type  */}
                    {
                        business?.business_type === 'both' && (
                            <>
                                <Text style={styles.title}>Order Source</Text>
                                <OrderSourceSelector
                                    onSelect={(value) => setSelectedOrderSource(value)}
                                    value={selectedOrderSource}
                                />
                            </>
                        )
                    }

                    {/* Select Customer */}
                    <View style={styles.slectCustomer}>
                        <SelectInput
                            title='Customer'
                            placeholder='Select customer'
                            iconName='person-outline'
                            iconType='Ionicons'
                            value={selectedCustomer?.name}
                            onPress={() => {
                                setShowSheet(true)
                                openSheet(
                                    'Select Customer',
                                    customers ?? [],
                                    selectedCustomer,
                                    ['name', 'phone'],
                                    'customers',
                                    'No Customers Yet',
                                    'Add customers first to create order'
                                )
                            }}
                        />
                        <AddRow
                            text='Add New Customer'
                            onPress={() => router.push('/addCustomer/AddCustomer')}
                        />
                    </View>

                    {/* add products */}
                    {/* <Button
                    title='Add Product'
                    onPress={() => {
                                setShowSheet(true)
                                openSheet(
                                    'Select Product',
                                    products ?? [],
                                    selectedProduct,
                                    ['name', 'price', 'stock_quantity'],
                                    'products',
                                    'No Products Yet',
                                    'Add products first to create order'
                                )
                            }}
                    /> */}
                    {/* <View style={styles.searchRow}>
                        <View style={{ flex: 1 }}>
                            <Input
                                placeholder='Search products...'
                                title='Add Products'
                                isOrderInput={true}
                                // value={searchText}
                                // onChangeText={setSearchText}
                                iconName='search-outline'
                                iconType='Ionicons'
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.buttonAdd}
                            activeOpacity={0.7}
                            onPress={() => {
                                setShowSheet(true)
                                openSheet(
                                    'Select Product',
                                    products ?? [],
                                    selectedProduct,
                                    ['name', 'price', 'stock_quantity'],
                                    'products',
                                    'No Products Yet',
                                    'Add products first to create order'
                                )
                            }}
                        >
                            <Icon
                                name='plus'
                                type='Entypo'
                                size={wp(6)}
                                color={Colors.surface}
                            />
                        </TouchableOpacity>
                    </View> */}
                    <Button
                    title='Add Items'
                    onPress={() => {
                                setShowSheet(true)
                                openSheet(
                                    'Select Product',
                                    products ?? [],
                                    selectedProduct,
                                    ['name', 'price', 'stock_quantity', 'image_url'],
                                    'products',
                                    'No Products Yet',
                                    'Add products first to create order'
                                )
                            }}
                        />




                    {
                        orderItems.length > 0 ? (
                            <View style={styles.itemContainer}>
                                <Text style={styles.titleText}>Order Items ({orderItems.length})</Text>
                                <View style={styles.summaryContainer}>
                                    {
                                        orderItems.map((item: any, index: number) => (
                                            <ItemCard
                                                key={index}
                                                name={item.name}
                                                price={item.price}
                                                currency={business?.currency}
                                                imageurl={item.image_url}
                                                stock={item.stock_quantity}
                                                quantity={item.quantity}
                                                onPressRemove={() => removeItem(item.product_id)}
                                                onIcrease={() => increaseQuantity(item.product_id)}
                                                onDecrease={() => decreaseQuantity(item.product_id)}
                                                isLast={index === orderItems.length - 1}
                                            />
                                        ))
                                    }
                                </View>
                            </View>
                        ):(<View style={styles.orderEmpty}>
                            <Text style={styles.orderEmptyText}>
                                Your order summary will appear here
                                </Text>

                        </View>)
                    }


                    {/* total overview */}

                    {
                        orderItems.length > 0 && (
                            <View>
                                <Text style={styles.titleText}>Price Summary
                                    <Text style={styles.titleTextCurrency}> ({business?.currency})</Text>
                                </Text>
                                <View style={styles.summaryContainer}>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryText}>Subtotal</Text>
                                        <Text style={styles.summaryText}>{subtotal.toLocaleString()}</Text>
                                    </View>
                                    <InputRow
                                        title='Discount'
                                        value={discount}
                                        borderWidth={0.3}
                                        //currency={business?.currency}
                                        onChangeText={(text: string) => {
                                            const value = Number(text);

                                            if (text === '' || value <= subtotal) {
                                                setDiscount(text);
                                            }
                                        }}
                                    />
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.totalText}>Total</Text>
                                        <Text style={styles.totalText}>{totalAmount.toLocaleString()}</Text>
                                    </View>

                                </View>
                            </View>

                        )

                    }

                    {
                        orderItems.length > 0 && (
                            <View>
                                <Text style={styles.titleText}>Amount Summary
                                    <Text style={styles.titleTextCurrency}> ({business?.currency})</Text>
                                </Text>
                                <View style={styles.summaryContainer}>

                                    <InputRow
                                        title='Amount Paid'
                                        value={amountPaid}
                                        //currency={business?.currency}
                                        onChangeText={(text: string) => setAmountPaid(text)}
                                    />
                                    {
                                        (amountPaid !== '' && Number(amountPaid) > Number(totalAmount)) && (
                                            <View style={styles.summaryRow}>
                                                <Text style={styles.totalText}>Change to return</Text>
                                                <Text style={styles.totalText}>{remaining.toLocaleString()}</Text>
                                            </View>
                                        )



                                    }
                                    {
                                        (amountPaid !== '' && Number(amountPaid) < Number(totalAmount)) && (
                                            <View style={styles.summaryRow}>
                                                <Text style={styles.totalText}>Remaining Credit (udhar)</Text>
                                                <Text style={styles.totalText}>{remaining.toLocaleString()}</Text>
                                            </View>
                                        )



                                    }


                                </View>
                            </View>

                        )

                    }

                </ScrollView>
                </KeyboardAvoidingView>
                <View style={styles.button}>
                    <Button
                        title='Confirm order & continue'
                        onPress={createOrder}
                        isLoading={isPending}
                        disabled={orderItems.length === 0 || !selectedCustomer || !totalAmount}
                    />
                </View>
            </SafeAreaView>
            {
                showSheet && (
                    <CustomBottomSheet
                        searchable={true}
                        bottomSheetRef={sheetRef}
                        searchPlaceholder={placeholder}
                        options={sheetOptions}
                        title={sheetTitle}
                        onSelect={handleSelect}
                        displayKeys={displayKeys}
                        currency={business?.currency}
                        emptyMessage={emptyMessage}
                        emptyTitle={emptyTitle}
                    //value=
                    />
                )

            }
        </View>

    );
};


const AddRow = ({ text, onPress }: { text: string, onPress: () => void }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addButton}
            onPress={onPress}
        >
            <Icon
                name='plus'
                type='Entypo'
                size={wp(5)}
                color={Colors.primary}
            />
            <Text style={styles.textButton}>{text}</Text>
        </TouchableOpacity>
    )
}
export default NewOrder;
