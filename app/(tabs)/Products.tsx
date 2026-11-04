import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import Colors from '../../src/constants/colors';


import { useUser } from '../../src/hooks/useUser';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { router, useFocusEffect } from 'expo-router';
import fonts, { fontSize } from '../../src/constants/typography';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import OfflineScreen from '../../src/components/common/OfflineScreen';
import ConfirmationDialog from '../../src/components/common/ConfirmationDialog';
import Header from '../../src/components/common/Header';
import CustomEmptyComponent from '../../src/components/common/CustomEmptyComponent';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useDeleteProduct } from '../../src/hooks/useDeleteProduct';
import Icon from '../../src/components/common/Icon';
import { quickActions } from '../../src/services/data/quickActions';
import Input from '../../src/components/common/Input';
import { useProducts } from '../../src/hooks/useProducts';
import ProductCard from '../../src/components/product/ProductCard';
import ProductSkeleton from '../../src/components/skeleton/ProductSkeleton';
import ActionCard from '../../src/components/home/ActionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardCard from '../../src/components/home/DashboardCard';
import { useState, useCallback } from 'react';
const Products = () => {
    const {isOffline, checkConnection} = useNetworkStatus()
    const { data, isLoading: userLoading, error: userError, refetch: userRefetch } = useUser()
    const userId = data?.id
    const { data: business, isLoading: businessLoading, error: businessError, refetch: businessRefetch } = useBusiness(userId)
    const { data: products, isLoading: productsLoading, error: productsError, refetch: productsRefetch } = useProducts(business?.id)
    const [searchText, setSearchText] = useState('')
    const [menuIndex, setMenuIndex] = useState<number | null>(null)
    useFocusEffect(
        useCallback(() => {
            setMenuIndex(null);
        }, [])
    );
    const [showDialog, setShowDialog] = useState(false)
    const [deleteId, setDeleteId] = useState('')
    const { mutate: deleteProduct, isPending, error } = useDeleteProduct(
        business?.id
    );

    const isLoading = userLoading || businessLoading || productsLoading || isPending
    const isErrorFetching = userError || businessError || productsError
    // search products
    const filterProducts = products?.filter(item =>
        item.name.toLowerCase().
            includes(searchText.trim().toLocaleLowerCase())
    )

    // handleRetry

    const handleRetry = async () => {
    const isConnected = await checkConnection();

    if (!isConnected) return;

    await Promise.all([
        userRefetch(),
        businessRefetch(),
        productsRefetch(),
    ]);
};
    // network

     if (isOffline && products===undefined) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Products' onPress={() => router.back()} />
                    <Input
                placeholder='Search product...'
                value={searchText}
                onChangeText={setSearchText}
                iconName='search-outline'
                iconType='Ionicons'
            />
                <OfflineScreen onPress={handleRetry}/>

            </SafeAreaView>
        )
    }
    
    // handleEdit

    const handlePressEdit = (productId: string) => {
        setMenuIndex(null);

        router.push({
            pathname: '/addProduct/AddProduct',
            params: {
                productId: productId
            }
        })
    }

    // render product
    const renderProduct = ({ item, index }: any) => {
        return (
            <ProductCard
                name={item.name}
                price={item.price}
                stock={item.stock_quantity}
                lowStock={item.low_stock_threshold}
                currency={business?.currency}
                imageurl={item.image_url}
                menuOpen={menuIndex === index}
                onMenuPress={() => {
                    setMenuIndex(menuIndex === index ? null : index)
                }}
                onPressEdit={() => handlePressEdit(item.id)}
                onPressDelete={() => {
                    setShowDialog(true),
                        setMenuIndex(null),
                        setDeleteId(item.id)

                }}
            />
        )
    }

    // error
    if (isErrorFetching && !isOffline && !products) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Products' onPress={() => router.back()} />
                    <Input
                placeholder='Search product...'
                value={searchText}
                onChangeText={setSearchText}
                iconName='search-outline'
                iconType='Ionicons'
            />
                <CustomEmptyComponent 
                isError={true}
                mainText='Something Went Wrong'
                subText='Unable to load products. Please try again.'
                onPress={handleRetry}
                />

            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <ConfirmationDialog
                modalVisible={showDialog}
                iconName='trash-outline'
                title='Delete Product?'
                msg='Are you sure you want to delete this product?'
                txtButton='Delete'
                onPressCancel={() => setShowDialog(false)}
                onPressDelete={() => {
                    deleteProduct(deleteId),
                    setShowDialog(false)
                }}
            />
            {menuIndex !== null && (
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => {
                        setMenuIndex(null),
                        console.log('overlay pressed');

                    }}
                />
            )}
            <Header title='Products' onPress={() => router.back()} />
            <Input
                placeholder='Search product...'
                value={searchText}
                onChangeText={setSearchText}
                iconName='search-outline'
                iconType='Ionicons'
            />
            {
                isLoading ? <ProductSkeleton /> : (
                    <FlatList
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: hp(6) }}
                        data={filterProducts ?? []}
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            searchText.trim() !== '' ? (
                                <CustomEmptyComponent
                                    mainText='No Matching Products'
                                    subText="We couldn't find any product matching your search. Try a different keyword."
                                />
                            ) : (
                                <CustomEmptyComponent
                                    illustration={require('../../assets/illustrations/noproduct.png')}
                                    mainText='No Products Yet'
                                    subText="Your products will appear here once you add them to your inventory."
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
        backgroundColor: Colors.background,
        padding: wp(3),
        flex: 1
    },

});

export default Products;
