//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import fonts, { fontSize } from '../constants/typography';
import Colors from '../constants/colors';
interface props {
    price?: string | number
    currency?: string,
    priceFontSize?: number,
    priceFont?: string
    priceColor?: string,
}
const PriceFormat: React.FC<props> = ({ price, currency, priceFont, priceColor, priceFontSize }) => {
    return (
        <View style={styles.container}>

            <Text style={styles.currency}>
                {currency}
            </Text>

            <Text style={[{fontFamily: priceFont, fontSize: priceFontSize, color: priceColor }]}>

                {price?.toLocaleString()}
            </Text>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        //alignItems: 'flex-end',
        gap: 5
    },
    currency: {
        fontFamily: fonts.medium,
        fontSize: fontSize.extraSmallText,
        color: Colors.textSecondary,
        textAlignVertical: 'bottom',
        marginBottom: 1.7
    }
});

//make this component available to the app
export default PriceFormat;
