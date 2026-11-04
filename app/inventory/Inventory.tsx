import { View, Text, FlatList } from 'react-native';
import styles from './InventoryStyle';
import { router } from 'expo-router';
import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useProducts } from '../../src/hooks/useProducts';
import Input from '../../src/components/common/Input';
import Icon from '../../src/components/common/Icon';
import Colors from '../../src/constants/colors';
import CustomEmptyComponent from '../../src/components/common/CustomEmptyComponent';
import ProductCard from '../../src/components/inventory/ProductCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../src/components/common/Header';
import InventoryTrackCard from '../../src/components/inventory/InventoryTrackCard';
import { useState } from 'react';
const Inventory = () => {
    const { data: user } = useUser()
    const { data: business } = useBusiness(user?.id)
    const { data: products } = useProducts(business?.id)
    const [searchText, setSearchText] = useState('')
    // search prodcut
    // search products
    const filterProducts = products?.filter(item =>
        item.name.toLowerCase().
            includes(searchText.trim().toLocaleLowerCase())
    )

    const allProducts = products?.length ?? 0;

    const lowStock = products?.filter((item) => {
        const stock = Number(item.stock_quantity);
        const threshold = Number(item.low_stock_threshold);
        return stock > 0 && stock <= threshold;
    }).length ?? 0;

    const outOfStock = products?.filter((item) => {
        return Number(item.stock_quantity) <= 0;
    }).length ?? 0;

    // render product
    const renderProduct = ({ item, index }: any) => {
        return (
            <ProductCard

                title={item.name}

                stock={item.stock_quantity}
                lowStock={item.low_stock_threshold}
                imageurl={item.image_url}
                //isLast={index === allProducts - 1}
                onPress={() => router.push({
                    pathname: '/stock/[product]',
                    params: {
                        productId: item.id
                    }
                })}
            />
        )

    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title='Inventory'
                onPress={() => router.back()}
            />
            <View style={styles.inventoryRow}>
                <InventoryTrackCard
                    title='Products'
                    text={allProducts}
                    bgColor='#EFF6FF'
                    color='#2563EB'
                    iconName='cube'
                    iconType='Ionicons'
                />
                <InventoryTrackCard
                    title='Low Stock'
                    text={lowStock}
                    bgColor={Colors.yellowExtraLight}
                    color={Colors.warning}
                    iconName='alert-circle'
                    iconType='Ionicons'
                />
                <InventoryTrackCard
                    title='Out of Stock'
                    text={outOfStock}
                    bgColor={Colors.errorLight}
                    color={Colors.error}
                    iconName='close-circle'
                    iconType='Ionicons'
                />
            </View>
            <Input
                placeholder='Search products...'
                value={searchText}
                onChangeText={setSearchText}
                iconName='search-outline'
                iconType='Ionicons'
            />
            {/* <Text style={styles.sectionTitle}>Inventory List</Text> */}
            {/* <View style={styles.flatlist}> */}
            <FlatList
                contentContainerStyle={styles.containerStyle}
                data={filterProducts ?? []}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                <CustomEmptyComponent
                    illustration={
                        searchText.trim() !== '' ? undefined :
                        require('../../assets/illustrations/noproduct.png')
                    }
                    mainText={searchText.trim() !== '' ? 'No Matching Products' : 'No Products Yet'}
                    subText={searchText.trim() !== '' ? "We couldn't find any product matching your search. Try a different keyword." : 
                        'Your products will appear here once you add them to your inventory.'}
                />}
            />
            {/* </View> */}


        </SafeAreaView>
    );
};

export default Inventory;
