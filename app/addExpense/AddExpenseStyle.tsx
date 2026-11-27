
import { StyleSheet } from 'react-native';
import fonts, { fontSize } from '../../src/constants/typography';
import Colors from '../../src/constants/colors';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: wp(3),
    },

    scrollContainer: {
        paddingBottom: hp(6),
        paddingTop: hp(0.5),
        flexGrow: 1,
    },

    heading: {
        fontFamily: fonts.extraBold,
        fontSize: fontSize.largeHeading,
        color: Colors.text,
        marginBottom: hp(2),
    },

    subHeading: {
        fontFamily: fonts.medium,
        fontSize: fontSize.text,
        color: Colors.textSecondary,
        marginBottom: hp(3),
    },

    button: {
        marginTop: hp(3),
    },

    selectContainer: {
        marginBottom: hp(2),
    },

    fieldLabel: {
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color: Colors.text,
        marginBottom: hp(1),
    },

    selectButton: {
        minHeight: hp(6.5),
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: wp(2.5),
        paddingHorizontal: wp(3),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.background,
    },

    selectValue: {
        fontFamily: fonts.regular,
        fontSize: fontSize.smallText,
        color: Colors.text,
        flex: 1,
    },

    placeholder: {
        color: Colors.textSecondary,
    },

    error: {
        fontFamily: fonts.regular,
        fontSize: fontSize.smallText,
        color: Colors.error,
        marginTop: hp(0.5),
    },

    dateButton: {
        minHeight: hp(6.5),
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: wp(2.5),
        paddingHorizontal: wp(3),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    dateContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },

    dateText: {
        fontFamily: fonts.regular,
        fontSize: fontSize.smallText,
        color: Colors.text,
    },
});

export default styles;
