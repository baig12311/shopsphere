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
    stock: number
    price?: number
    lowStock?: number
    currency?: string
    imageurl?: string,
    onIcrease?: () => void,
    onDecrease?: () => void
    onPressRemove?: () => void
    quantity?: number
    isLast?: boolean
}
const ItemCard: React.FC<props> = ({ isLast, onIcrease, onDecrease, onPressRemove, quantity, name, stock, price, currency,
    imageurl, }) => {
    return (
        <View style={[styles.container,
        !isLast && { borderBottomWidth: 0.3 }
        ]}
        >
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
                            size={wp(6)}
                            color={Colors.primary}
                        />
                    </View>
                )
            }


            <View style={styles.content}>

                <Text style={styles.name} numberOfLines={1}>{name}</Text>



                <Text style={styles.price}>
                    {currency} {price?.toLocaleString()}
                </Text>

            </View>
            <View style={{ gap: 5, marginLeft: wp(2), flexDirection: 'row' }}>

                <View style={styles.quantityControls}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.button}
                        onPress={onDecrease}
                    >
                        <Icon
                            name="minus"
                            type="Entypo"
                            size={wp(5)}
                            color={Colors.text}
                        />
                    </TouchableOpacity>

                    <Text
                        style={styles.quantityText}
                        numberOfLines={1}

                    >{quantity}</Text>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.button}
                        onPress={onIcrease}
                    >

                        <Icon
                            name="plus"
                            type="Entypo"
                            size={wp(5)}
                            color={Colors.text}
                        />
                    </TouchableOpacity>

                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{ padding: wp(2) }}
                    onPress={onPressRemove}
                >
                    <Icon
                        name="trash-outline"
                        type="Ionicons"
                        size={wp(4)}
                        color={Colors.error}
                    />
                </TouchableOpacity>

            </View>

        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        paddingVertical: hp(2),
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(2),
        borderColor: Colors.textSecondary,
    },
    image: {
        borderWidth: 0.3,
        width: wp(12),
        height: wp(12),
        borderRadius: wp(2),
        borderColor: Colors.textMuted,
        overflow: 'hidden'
    },
    placeholder: {
        borderWidth: 0.3,
        width: wp(12),
        height: wp(12),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp(2),
        borderColor: Colors.textMuted,
        backgroundColor: Colors.background
        //overflow: 'hidden'
    },
    content: {
        marginLeft: wp(3),
        flex: 1,
        //justifyContent: 'space-between'
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    name: {
        fontFamily: fonts.medium,
        fontSize: fontSize.text,
        marginBottom: hp(0.5)
    },
    price: {
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText
    },
    quantityControls: {
        flexDirection: 'row',
    },
    controlText: {
        fontFamily: fonts.bold,
        fontSize: fontSize.heading,
        color: Colors.text,
        borderWidth: 1,
        //alignSelf: 'center'
        //textAlignVertical:'center'
    },
    button: {
        width: wp(10),
        height: wp(8),
        borderRadius: wp(2),
        borderWidth: 0.5,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: wp(1)
    },
    quantityText: {
        fontFamily: fonts.medium,
        fontSize: fontSize.text,
        textAlignVertical: 'center',
        textAlign: 'center',
        color: Colors.text,
        //borderWidth:0.5,
        width: wp(8)
    }

});

//make this component available to the app
export default ItemCard;
