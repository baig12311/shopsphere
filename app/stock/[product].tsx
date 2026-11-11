import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';
import { router } from 'expo-router';
import Icon from '../../src/components/common/Icon';
import { useProductById } from '../../src/hooks/useProducts';
import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useLocalSearchParams } from 'expo-router';
import { restockSchema } from '../../src/services/schema/restockSchema';
import { adjustStockSchema } from '../../src/services/schema/adjustStockSchema';
import { useRestockProduct } from '../../src/hooks/useRestockProduct';
import { useAdjustStock } from '../../src/hooks/useAdjustStock';
import { useInventoryMovements } from '../../src/hooks/useInventoryMovements';
import { formatDate } from '../../src/services/formatDate';
import StockCard from '../../src/components/inventory/StockCard';
import ProductStockSkeleton from '../../src/components/skeleton/ProductStockSkeleton';
import RestockModal from '../../src/components/inventory/RestockModal';
import ActionButton from '../../src/components/inventory/ActionButton';
import Colors from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import StockAlert from '../../src/components/inventory/StockAlert';
import CustomEmptyComponent from '../../src/components/common/CustomEmptyComponent';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { success } from 'zod';
import { useToast } from '../../src/context/ToastContext';
import Row from '../../src/components/inventory/Row';
const ProductDetail = () => {
    const {showToast} = useToast()
    const { productId } = useLocalSearchParams<{ productId: string }>()
    const { data: user, isLoading: userLoading, error: userError, refetch: userRefetch} = useUser()
    const { data: business, isLoading: businessLoading, error: businessError, refetch: businessRefetch} = useBusiness(user?.id)
    const { data, isLoading, error:productError, refetch: productRefetch} = useProductById(productId)
    const { data: inventory, isLoading: inventoryLoading, error:inventoryError, refetch: inventoryRefetch} = useInventoryMovements(productId)
    const { mutateAsync: addRestockMutation, isPending: addPending } = useRestockProduct()
    const { mutateAsync: addAdjustmentMutation, isPending: adjustPending } = useAdjustStock()
    const [showRestock, setShowRestock] = useState(false)
    const [showAdjustStock, setShowAdjustStock] = useState(false)
    const [restock, setRestock] = useState('')
    const [restockError, setRestockError] = useState('')
    const [adjustStock, setAdjustStock] = useState('')
    const [reason, setReason] = useState('')
    const [adjustErrors, setAdjustErrors] = useState<{ newStock?: string, reason?: string }>({})
    const [showDropdown, setShowDropdown] = useState(false)
    const Loading = userLoading || businessLoading || isLoading || inventoryLoading
    const pending = addPending || adjustPending
    const currency = business?.currency
    const image = data?.image_url
    const name = data?.name
    const costPrice = data?.cost_price
    const sellingPrice = data?.price
    const stock = data?.stock_quantity ?? 0
    const lowStockThreshold = data?.low_stock_threshold ?? 0
    const outStock = stock <= 0
    const lowStock = stock > 0 && stock <= lowStockThreshold
    const inventoryLength = inventory?.length
    const colors = outStock ? { iconBg: Colors.errorLight, color: Colors.error } :
        lowStock ? { iconBg: Colors.warningLight, color: Colors.warning } :
            { iconBg: Colors.successLight, color: Colors.primary }
    const badgeTitle = outStock ? 'Out of Stock' : lowStock ? 'Low Stock' : 'In Stock'
    const icon = outStock ? { name: 'close-circle', type: 'Ionicons' } :
        lowStock ? { name: 'alert-circle', type: 'Ionicons' } : { name: 'checkmark-circle', type: 'Ionicons' }

        const isErrorFetching = userError || businessError || productError || inventoryError

        const handleRetry = () =>{
            userRefetch()
            businessRefetch()
            productRefetch()
            inventoryRefetch()
        }
    // handle save

    const handleRestock = async () => {
        const result = restockSchema.safeParse({
            quantity: restock
        })

        if (!result.success) {
            const fieldError = result.error.issues[0]?.message
            setRestockError(fieldError)
            return
        }
        try {
            await addRestockMutation({
                businessId: business?.id,
                productId: productId,
                quantity: Number(restock)
            })
            setShowRestock(false)
            setRestock('')
            showToast(
                'success',
                'Stock Updated',
                'Stock has been restocked successfully.'
            )

        } catch (error) {
            showToast(
                'error',
                'Unable to Restock Product',
                "We couldn't update stock. Please try again."
            )

        }
    }

    // handle adjust
    const handleAdjust = async () => {
        const result = adjustStockSchema.safeParse({
            newStock: adjustStock,
            reason: reason

        })
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            setAdjustErrors({
                newStock: fieldErrors.newStock?.[0],
                reason: fieldErrors.reason?.[0]

            })
        }
        try {
            await addAdjustmentMutation({
                businessId: business!.id,
                productId: productId!,
                newStock: Number(adjustStock),
                reason,
            })
            setShowAdjustStock(false)
            setAdjustStock('')
            setReason('')
            showToast(
                'success',
                'Stock Adjusted',
                'Stock quantity has been adjusted successfully.'
            )
        } catch (error) {
            showToast(
                'error',
                'Unable to Adjust Stock',
                "We couldn't adjust stock. Please try again."
            )
        }
    }

    // render stock
    const renderStock = ({ item, index }: { item: any, index: number }) => {
        const date = formatDate(item.created_at)
        return (
            <StockCard
                isLast={inventory && (index === (inventoryLength ?? 0) - 1)}
                type={item.type}
                quantity={item.quantity}
                reason={item.reason}
                date={date}
                invoice={item.orders?.order_number}
            />
        )
    }
    // error
    if (isErrorFetching) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Product Stock' onPress={() => router.back()} />
                <CustomEmptyComponent 
                isError={true}
                mainText='Something Went Wrong'
                subText='Unable to load data. Please try again.'
                onPress={handleRetry}
                />

            </SafeAreaView>
        )
    }
    // loading
    if (Loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Product Stock' onPress={() => router.back()} />
                <ProductStockSkeleton />
            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView style={styles.container}>

            <Header title='Product Stock' onPress={() => router.back()} />
            {
                showRestock && (
                    <RestockModal
                        stock={stock}
                        modalVisible={showRestock}
                        value={restock}
                        error={restockError}
                        heading='Restock Product'
                        subHeading='Add stock to your product'
                        inputTitle='Quantiy to Add*'
                        stockTitle='New Stock'
                        buttonTitle='Confirm Restock'
                        onChangeText={(t: string) => { setRestock(t), setRestockError('') }}
                        onPressCancel={() => { setShowRestock(false), setRestock(''), setRestockError('') }}
                        onPressSave={handleRestock}
                        loader={pending}
                    />)
            }
            {
                showAdjustStock && (
                    <RestockModal
                        stock={stock}
                        modalVisible={showAdjustStock}
                        value={adjustStock}
                        reason={reason}
                        error={adjustErrors.newStock}
                        reasonError={adjustErrors.reason}
                        //error={adjustError}
                        heading='Adjust Stock'
                        subHeading='Manually update inventory'
                        inputTitle='New Stock*'
                        stockTitle='Stock Change'
                        buttonTitle='Confirm Adjustment'
                        open={showDropdown}
                        onPressDrop={() => setShowDropdown(!showDropdown)}
                        onCloseDrop={() => setShowDropdown(false)}
                        onChangeReason={(value) => {
                            setReason(value),
                                setAdjustErrors({
                                    ...adjustErrors,
                                    reason: undefined
                                })
                        }}
                        onChangeText={(t: string) => {
                            setAdjustStock(t),
                                setAdjustErrors({
                                    ...adjustErrors,
                                    newStock: undefined
                                })
                        }}
                        onPressCancel={() => {
                            setShowAdjustStock(false), setAdjustStock(''), setReason('')
                            setAdjustErrors({
                                newStock: undefined,
                                reason: undefined
                            })
                        }}
                        onPressSave={handleAdjust}
                        loader={pending}
                    />)
            }

            <View style={{ flex: 1 }}>
                <View style={styles.productContainer}>
                    {
                        image ? (
                            <Image
                                source={{ uri: image }}
                                style={styles.image}
                            />
                        ) : (
                            <View style={styles.placeholder}>
                                <Icon
                                    name='cube-outline'
                                    type='Ionicons'
                                    size={wp(10)}
                                    color={Colors.primary}
                                />
                            </View>
                        )
                    }
                    <View style={styles.textContainer}>
                        <Text style={styles.name}>{name}</Text>
                        <Row
                            title='Cost Price'
                            info={costPrice.toLocaleString()}
                            currency={currency}
                        />
                        <Row
                            title='Selling Price'
                            info={sellingPrice.toLocaleString()}
                            currency={currency}
                        />
                    </View>
                </View>
                <StockAlert
                    iconBgColor={colors.iconBg}
                    //bgColor={Colors.warningLightExtra}
                    color={colors.color}
                    iconName={icon.name}
                    iconType={icon.type}
                    stock={stock}
                    threshold={lowStockThreshold}
                    badge={badgeTitle}
                />
                <View style={styles.action}>
                    <ActionButton
                        iconName='package-variant-closed-plus'
                        iconType='MaterialDesignIcons'
                        iconColor={Colors.surface}
                        mainText='Restock'
                        subText='Add more inventory'
                        maincolor={Colors.surface}
                        subColor={Colors.surface}
                        bgColor={Colors.primary}
                        onPress={() => setShowRestock(true)}
                    />
                    <ActionButton
                        iconName='options-outline'
                        iconType='Ionicons'
                        iconColor={Colors.primary}
                        mainText='Adjust Stock'
                        subText='Manually update quantity'
                        maincolor={Colors.primary}
                        subColor={Colors.textSecondary}
                        bgColor={Colors.surface}
                        borderColor={Colors.border}
                        borderWidth={0.5}
                        onPress={() => setShowAdjustStock(true)}
                    />
                </View>
                {
                    inventory && inventory.length > 0 && (
                        <View style={styles.stockContainer}>
                            <Text style={styles.stockHeading}>Stock History</Text>
                            <FlatList
                                style={{ flex: 1 }}
                                contentContainerStyle={styles.containerStyle}
                                data={inventory}
                                renderItem={renderStock}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    )
                }


            </View>


        </SafeAreaView>
    );
};




export default ProductDetail;
