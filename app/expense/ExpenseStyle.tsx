// import { StyleSheet } from "react-native";
// import Colors from "../../src/constants/colors";
// import { widthPercentageToDP as wp,
//     heightPercentageToDP as hp
// } from "react-native-responsive-screen"; 
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: Colors.background,
//         padding: wp(3)
//     },
//     floatingButton:{
//         position: 'absolute',
//         bottom: 50,
//         right: 25,
//         width: wp(15),
//         height: wp(15),
//         borderRadius: wp(15),
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: Colors.primary
        
//     }
// });
// export default styles;



// expense style from GPT


import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from '../../src/constants/colors';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF9',
    },

    floatingButton: {
        position: 'absolute',
        right: wp(5),
        bottom: hp(3),
        width: wp(14),
        height: wp(14),
        borderRadius: wp(7),
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        elevation: 5,
    },

    listContent: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(12),
        flexGrow: 1,
    },

    summaryCard: {
        backgroundColor: Colors.primary,
        borderRadius: wp(4),
        padding: wp(5),
        marginBottom: hp(3),
    },

    summaryLabel: {
        fontSize: wp(3.5),
        color: '#FFFFFF',
        opacity: 0.85,
        fontFamily: 'Manrope-Medium',
    },

    summaryAmount: {
        fontSize: wp(7),
        color: '#FFFFFF',
        fontFamily: 'Manrope-Bold',
        marginTop: hp(1),
    },

    summaryDescription: {
        fontSize: wp(3),
        color: '#FFFFFF',
        opacity: 0.8,
        marginTop: hp(0.5),
        fontFamily: 'Manrope-Regular',
    },

    sectionTitle: {
        fontSize: wp(4.5),
        color: '#202824',
        fontFamily: 'Manrope-Bold',
        marginBottom: hp(1.5),
    },

    expenseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: wp(3.5),
        borderRadius: wp(3),
        marginBottom: hp(1.2),
        borderWidth: 1,
        borderColor: '#EDF0EE',
    },

    expenseIcon: {
        width: wp(11),
        height: wp(11),
        borderRadius: wp(3),
        backgroundColor: '#EAF5EF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wp(3),
    },

    expenseDetails: {
        flex: 1,
        marginRight: wp(2),
    },

    expenseTitle: {
        fontSize: wp(3.6),
        color: '#202824',
        fontFamily: 'Manrope-SemiBold',
    },

    expenseMeta: {
        fontSize: wp(2.9),
        color: '#858D88',
        marginTop: hp(0.5),
        fontFamily: 'Manrope-Regular',
    },

    expenseAmount: {
        fontSize: wp(3.3),
        color: '#D9534F',
        fontFamily: 'Manrope-Bold',
    },

    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(8),
    },

    stateTitle: {
        fontSize: wp(4.5),
        color: '#202824',
        fontFamily: 'Manrope-Bold',
        textAlign: 'center',
        marginTop: hp(1.5),
    },

    messageText: {
        fontSize: wp(3.4),
        color: '#858D88',
        fontFamily: 'Manrope-Regular',
        textAlign: 'center',
        lineHeight: wp(5.5),
        marginTop: hp(1),
    },

    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: wp(7),
        paddingVertical: hp(1.3),
        borderRadius: wp(2.5),
        marginTop: hp(2),
    },

    retryText: {
        color: '#FFFFFF',
        fontSize: wp(3.5),
        fontFamily: 'Manrope-SemiBold',
    },

    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingVertical: hp(5),
    },

    emptyIcon: {
        width: wp(19),
        height: wp(19),
        borderRadius: wp(9.5),
        backgroundColor: '#EAF5EF',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default styles;
