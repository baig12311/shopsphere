import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../constants/colors';
import FormatPrice from '../../utils/FormatPrice';
import fonts, { fontSize } from '../../constants/typography';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';

interface Props {
    subTotal: string | number
    total: string | number
    discount: string | number
    change: string | number
    paid: string | number
    currency?:string
}
const PriceSummaryCard: React.FC<Props> = ({currency, subTotal, total, paid, discount, change }) => {
    const PaidAmount = (Number(paid) >= Number(total)) ? total : paid
    const dueAmount = Number(total) - Number(PaidAmount)
    return (
        <View style={styles.container}>
            <Row
                title='SubTotal'
                info={subTotal.toLocaleString()}
                fontWeight={fonts.medium}
                fsize={fontSize.text}
                currency={currency}
            />
            <Row
                title='Discount'
                info={discount.toLocaleString()}
                fontWeight={fonts.medium}
                fsize={fontSize.text}
                currency={currency}
                isBorder={true}
            />
            <Row
                title='Total'
                info={total.toLocaleString()}
                fontWeight={fonts.bold}
                fsize={fontSize.subHeading}
                currency={currency}
            />
            <Row
                title='Amount Paid'
                info={PaidAmount.toLocaleString()}
                fontWeight={fonts.medium}
                fsize={fontSize.text}
                currency={currency}
                isBorder={Number(dueAmount) > 0 ? true: false}
            />
            {
                dueAmount > 0 && (
                    <Row
                title='Due Amount'
                info={dueAmount.toLocaleString()}
                fontWeight={fonts.medium}
                fsize={fontSize.text}
                currency={currency}
            />
                )
            }
            

        </View>
    );
};
interface props {
    title: string
    info: string
    fontWeight?:string
    fsize?:number
    currency?:string
    isBorder?:boolean
}
const Row: React.FC<props> = ({ currency, title, info, fontWeight, fsize, isBorder}) => {
    
    return (
        <View style={[styles.row, isBorder && {borderBottomWidth: 0.3}]}>
            <Text style={{fontFamily: fontWeight, fontSize:fsize}}>{title}</Text>
            <FormatPrice 
            price={info} 
            currency={currency} 
            priceFont={fontWeight} 
            priceFontSize={fsize} />
            {/* <Text  style={{fontFamily: fontWeight, fontSize:fsize}}>{currency} {info}</Text> */}
        </View>
    )

}
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        elevation: 1,
        borderRadius: wp(2),
        padding: wp(2),
        marginBottom:hp(2)

    },
    row: {
        flexDirection: 'row',
        paddingVertical: hp(0.7),
        borderColor: Colors.textSecondary,
        justifyContent: 'space-between',
    },
    
});

//make this component available to the app
export default PriceSummaryCard;
