import { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import Colors from '../../constants/colors';
import { Image } from 'expo-image';
import fonts, { fontSize } from '../../constants/typography';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Icon from '../common/Icon';
interface props {
    name?: string
    price?: string
    quantity?: string | number
    subTotal?: string | number
    isHeading?:boolean
}
const InvoiceRow: React.FC<props> = ({ name, price, quantity, subTotal, isHeading}) => {
  
    return (
        <View style={styles.container}>
            <Text style={[styles.textName, isHeading && {fontFamily:fonts.bold}]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.text, {flex:0.6}, isHeading && {fontFamily:fonts.bold}]}>{quantity}</Text>
            <Text style={[styles.text, {flex:1, marginLeft: 10}, isHeading && {fontFamily:fonts.bold}]}>{price}</Text>
            <Text style={[styles.text, {flex:1}, isHeading && {fontFamily:fonts.bold}]}>{subTotal}</Text>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        //borderWidth:1,
        flexDirection: 'row',
        marginBottom: hp(1.5)
    },
    textName: {

        textAlign: 'left',
        //width: wp(28),
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color: Colors.text,
        flex:2
    },
    text: {
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color: Colors.text,
        textAlign: 'right'
    }
});

//make this component available to the app
export default InvoiceRow;
