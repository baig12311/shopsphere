
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../../constants/colors';
import Icon from '../common/Icon';
import fonts, { fontSize } from '../../constants/typography';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
interface props {
    date?: any
    orderNumber?: string
    amount: number
    paidAmount: number
    currency?: string
    onPress?: () => void
    disabled?: boolean
    customer?: string
    status?: string
    orderSource?: string
}
const OnlineOrderCard: React.FC<props> = ({ orderSource, status, customer, onPress, date, orderNumber, amount, paidAmount, currency, disabled }) => {
    // const formatDate = new Date(date).toLocaleDateString('en-GB', {
    //     day: '2-digit',
    //     month: 'short',
    //     year: 'numeric',
    // });

    const due = paidAmount - amount
    const totalPaid = paidAmount >= amount ? amount : paidAmount
    // const badgeText = (paidAmount > 0 && due < 0) ? 'Partially Paid' : paidAmount === 0 ? 'Due' : 'Paid'
    const badgeColor = status === 'Pending' ? { bg: Colors.warningLight, color: Colors.yellow } :
        status === 'Confirmed' ? { bg: Colors.blueLight, color: Colors.blue } :
            status === 'Shipped' ? { bg: Colors.successLight, color: Colors.primary } :
                { bg: Colors.errorLight, color: Colors.error }

    const badgeText = (paidAmount > 0 && due < 0) ? 'Partially Paid' : paidAmount === 0 ? 'Due' : 'Paid'
    const amountBadgeColor = badgeText === 'Paid' ? { bg: Colors.successLight, color: Colors.primary } :
        badgeText === 'Due' ? { bg: Colors.errorLight, color: Colors.error } :
            { bg: Colors.warningLight, color: Colors.yellow }
    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.7}
            disabled={disabled}
            onPress={onPress}
        >
            <View style={styles.header}>
                <Text style={styles.order}>Order # {orderNumber}</Text>
                <View style={styles.badgeRow}>
                    <Text style={[styles.badgeText,
                    { backgroundColor: badgeColor.bg, color: badgeColor.color }
                    ]}>{status}</Text>
                    {
                        status !== 'Cancelled' && (
                            <Text style={[styles.badgeText,
                            { backgroundColor: amountBadgeColor.bg, color: amountBadgeColor.color }
                            ]}>{badgeText}</Text>
                        )
                    }

                </View>



            </View>
            {
                (orderSource || customer) && (
                    <View style={styles.statusView}>
                        {

                            customer && (<Text style={styles.customer}>{customer}</Text>)}

                        {orderSource && <Text style={[styles.customer, { color: Colors.textSecondary }]}>{orderSource} order</Text>}

                    </View>
                )
            }


            <Text style={styles.dateO}>{date}</Text>
            {
                status !== 'Cancelled' && (
                    <View style={styles.amountRow}>
                        <Text numberOfLines={1} style={styles.date}>Total: <Text style={{ color: Colors.text }}>{currency} {amount.toLocaleString()}</Text></Text>
                        <View style={styles.divider} />
                        <Text numberOfLines={1} style={styles.date}>Paid: <Text style={{ color: Colors.primary }}>{currency} {totalPaid.toLocaleString()}</Text></Text>

                        {
                            due < 0 ? (
                                <>
                                    <View style={styles.divider} />
                                    <Text numberOfLines={1} style={styles.date}>Due: <Text style={{ color: Colors.error }}>{currency} {due.toLocaleString()}</Text></Text>
                                </>


                            ) : 
                            (
                                <View style={{ flex: 1 }} />
                            )
                        }
                    </View>
                )
            }



        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    container: {
        borderRadius: wp(2),
        padding: wp(3),
        backgroundColor: Colors.surface,
        elevation: 1,
        marginBottom: hp(2),

    },
    textContainer: {
        flex: 1,
        marginLeft: wp(3)
    },
    order: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize.text,
        color: Colors.text,
        //marginBottom: hp(1)
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 3
    },
    date: {
        fontFamily: fonts.medium,
        fontSize: fontSize.extraSmallText,
        color: Colors.textSecondary,
        flex:1,
        flexShrink:1,
        textAlign:'center'
    },
    dateO: {
        fontFamily: fonts.medium,
        fontSize: fontSize.extraSmallText,
        color: Colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: hp(1),
    },
    divider: {
        height: hp(2.5),
        borderWidth: 0.5,
        borderColor: Colors.textMuted
    },
    badgeText: {
        fontFamily: fonts.medium,
        fontSize: fontSize.extraSmallText,
        paddingHorizontal: wp(3),
        paddingVertical: wp(0.5),
        borderRadius: wp(50)
        //color: Colors.textSecondary
    },
    customer: {
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color: Colors.text,
        marginBottom: hp(0.5)
    },
    statusView: {
        flexDirection: 'row',
        gap: 20
    }
});

//make this component available to the app
export default OnlineOrderCard;
