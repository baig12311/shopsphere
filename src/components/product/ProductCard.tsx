import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Colors from '../../constants/colors';
import fonts, { fontSize } from '../../constants/typography';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Icon from '../common/Icon';
interface props {
    name?: string
    stock?: number
    price?: number
    lowStock?: number
    currency?: string
    imageurl?: string,
    menuOpen?: boolean
    onMenuPress?: () => void
    onPressEdit?: () => void
    onPressDelete?: () => void
}
const ProductCard: React.FC<props> = ({ name, stock, price, lowStock, currency,
    imageurl, onMenuPress, menuOpen, onPressDelete, onPressEdit }) => {
    const stockValue = Number(stock)
    const lowStockValue = Number(lowStock)
    const isStockLow = stockValue <= lowStockValue
    const isStockOut = stockValue <= 0
    const [showView, setShowView] = useState(false)
    return (
        <View style={[styles.container, menuOpen && { zIndex: 1000 },]}>
            {
                imageurl ? (
                    <Image
                        style={styles.image}
                        source={{ uri: imageurl }}
                        resizeMode='cover'
                    />
                ) : (
                    <View style={styles.placeholder}>
                        <Icon
                            name='cube-outline'
                            type='Ionicons'
                            size={wp(7)}
                            color={Colors.primary}
                        />
                    </View>
                )
            }

            <View style={styles.content}>
                <View style={styles.option}>
                    <Text numberOfLines={1} style={[styles.name, { color: Colors.text }]}>{name}</Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={{ paddingLeft: wp(2) }}
                        onPress={onMenuPress}
                    >
                        <Icon
                            name='dots-three-vertical'
                            type='Entypo'
                            size={wp(5)}
                            color={Colors.textSecondary}
                        />
                    </TouchableOpacity>

                </View>

                <Text style={[styles.name, { marginBottom: hp(0.5), color: Colors.text }]}>
                    {currency} {price?.toLocaleString()}
                </Text>
                <View style={styles.bottom}>
                    <Text style={[styles.name, { color: Colors.textSecondary, fontSize: fontSize.smallText, fontFamily: fonts.medium }]}>
                        stock: {Number(stock) <= 999 ? stock : '999+'}</Text>
                    <Text style={[styles.badge,
                    isStockOut ? styles.outStock : isStockLow ? styles.lowBadge : styles.stockBadge
                    ]}>{isStockOut ? 'Out of Stock' : isStockLow ? 'Low Stock' : 'In Stock'}</Text>
                </View>
            </View>
            {
                menuOpen && (
                    <View style={styles.menu}>
                        <TouchableOpacity
                            style={styles.row}
                            activeOpacity={0.7}
                            onPress={onPressEdit}
                        >
                            <Icon
                                name='edit'
                                type='Feather'
                                size={wp(5)}
                                color={Colors.primary}
                            />
                            <Text style={[styles.rowText, { color: Colors.primary }]}>Edit</Text>

                        </TouchableOpacity>
                        {/* <TouchableOpacity
                            style={styles.row}
                            activeOpacity={0.7}
                            onPress={onPressDelete}
                        >
                            <Icon
                                name='trash-outline'
                                type='Ionicons'
                                size={wp(5)}
                                color={Colors.error}
                            />
                            <Text style={[styles.rowText, { color: Colors.error }]}>Delete</Text>

                        </TouchableOpacity> */}

                    </View>
                )
            }
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        flexDirection: 'row',
        padding: wp(3),
        borderRadius: wp(3),
        alignItems: 'center',
        marginBottom: hp(2),
        elevation: 1,
        position: 'relative',
    },
    image: {
        borderWidth: 0.3,
        width: wp(15),
        height: wp(15),
        borderRadius: wp(2),
        borderColor: Colors.textMuted,
        overflow: 'hidden'
    },
    placeholder: {
        borderWidth: 0.3,
        width: wp(15),
        height: wp(15),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp(2),
        borderColor: Colors.textMuted,
        backgroundColor: Colors.background
        //overflow: 'hidden'
    },
    content: {
        marginLeft: wp(3),
        flex: 1
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    name: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize.text,
        flexShrink: 1
    },
    badge: {
        fontFamily: fonts.medium,
        fontSize: fontSize.extraSmallText,
        borderRadius: wp(50),
        paddingHorizontal: wp(2)
    },
    lowBadge: {
        color: Colors.warning,
        backgroundColor: Colors.warningLight
    },
    stockBadge: {
        color: Colors.primary,
        backgroundColor: Colors.successLight
    },
    outStock: {
        color: Colors.error,
        backgroundColor: Colors.errorLight
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    menu: {
        position: 'absolute',
        right: 5,
        top: 35,
        backgroundColor: Colors.background,
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.5),
        elevation: 3,
        borderRadius: wp(2),
        zIndex: 999
    },
    row: {
        flexDirection: 'row',
        marginVertical: hp(0.5)
    },
    rowText: {
        fontFamily: fonts.regular,
        fontSize: fontSize.smallText,
        marginLeft: wp(2)
    }
});

//make this component available to the app
export default ProductCard;
