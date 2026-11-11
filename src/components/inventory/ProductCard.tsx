import { View, Text, StyleSheet, Touchable, TouchableOpacity, Image} from 'react-native';
import Colors from '../../constants/colors';

import fonts, { fontSize } from '../../constants/typography';
import Icon from '../common/Icon';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
interface props {
    title?: string
    stock?: number
    imageurl?: string
    lowStock?: string,
    isLast?: boolean
    onPress?:()=>void
}
const ProductCard: React.FC<props> = ({onPress, title, stock, imageurl, lowStock, isLast }) => {
    const stockValue = Number(stock)
    const lowStockValue = Number(lowStock)
    const isStockLow = stockValue <= lowStockValue
    const isStockOut = stockValue <= 0
    return (
        <TouchableOpacity 
        style={styles.container}
        activeOpacity={0.7}
        onPress={onPress}
        >
            {/* <View style={{borderWidth:1,flex:1}}> */}
            {
                imageurl ? (<Image
                    source={{ uri: imageurl }}
                    style={styles.image}
                />) : (
                    <View style={styles.placeholder}>
                        <Icon
                            name='cube-outline'
                            type='Ionicons'
                            size={wp(5)}
                            color={Colors.primary}
                        />
                    </View>
                )
            }

            {/* </View> */}

            <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
                {/* <Text style={styles.text}>{stock}</Text> */}
                <View style={styles.stockContainer}>

                    <Text style={styles.text}>stock: {Number(stock) <= 999 ? stock : '999+'}</Text>



                    <Text style={[styles.badgeText,
                    isStockOut ? styles.outStock : isStockLow ? styles.lowBadge : styles.stock
                    ]}>{isStockOut ? 'Out of Stock' : isStockLow ? 'Low Stock' : 'In Stock'}</Text>
                </View>
            </View>
            <Icon
                    name='chevron-small-right'
                    type='Entypo'
                    size={wp(7)}
                    color={Colors.textSecondary}
                />


        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        //borderWidth:0.5,
        padding: wp(2),
        flexDirection: 'row',
        alignItems: 'center',
        //borderColor: Colors.surface,
        backgroundColor: Colors.surface,
        borderRadius: wp(2),
        elevation: 1,
        marginBottom: hp(2)
    },

    title: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize.text,
        color: Colors.text,
        width: '65%',
        marginBottom: hp(0.5),
        //marginBottom: hp(1)
    },
    text: {
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color: Colors.textSecondary,

    },
    image: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(2),
        borderWidth: 0.3,
        borderColor: Colors.border
    },
    placeholder:{
        borderWidth: 0.3,
        width: wp(10),
        height: wp(10),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp(2),
        borderColor: Colors.textMuted,
        backgroundColor: Colors.background
        //overflow: 'hidden'
    },
    textContainer: {
        flex: 1,
        marginHorizontal: wp(3),
        //width: '50%'
    },
    badgeText: {
        fontSize: fontSize.extraSmallText,
        fontFamily: fonts.medium,
        paddingVertical: wp(1),
        borderWidth: 1,
        borderRadius: wp(2),
        width: wp(22),
        textAlign: 'center',
        marginLeft: wp(3)
        //flex:1
    },
    outStock: {
        color: Colors.error,
        borderColor: Colors.error
    },
    lowBadge: {
        color: Colors.warning,
        borderColor: Colors.warning
    },
    stock: {
        color: Colors.primary,
        borderColor: Colors.primary
    },
    stockContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
});

//make this component available to the app
export default ProductCard;
