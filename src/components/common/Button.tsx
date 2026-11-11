import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Colors from '../../constants/colors';
import fonts, { fontSize } from '../../constants/typography';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Icon from './Icon';
interface props {
    title: string
    onPress?: () => void
    isLoading?: boolean
    disabled?: boolean
    isDelete?:boolean
}
const Button: React.FC<props> = ({ title, onPress, isLoading, disabled, isDelete}) => {
    const isStatus = title === 'Change Status'
    return (
        <TouchableOpacity
            style={[styles.container,
            isLoading && { backgroundColor: Colors.textMuted },
            disabled && { backgroundColor: Colors.textMuted },
            (isDelete && !disabled) && {backgroundColor: Colors.error},
            isStatus && {height: hp(5)}
            ]}
            activeOpacity={0.7}
            onPress={onPress}
            disabled={isLoading || disabled}
        >
            {
                isLoading ? (<ActivityIndicator size='small' color={Colors.primary} />) : (
                    <>
                    {
                        title === 'Add Items' && (
                            <Icon
                            name='plus'
                            type='Entypo'
                            size={wp(5)}
                            color={Colors.surface}
                            />
                        )
                    }
                    <Text style={[styles.text,
                    disabled && { color: Colors.textSecondary },
                    isStatus && {fontSize: fontSize.text}
                    ]}>{title}</Text>
                    </>

                )
            }
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: wp(2),
        height: hp(5.5),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        gap: 10,
        elevation: 1
    },
    text: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize.subHeading,
        color: Colors.background
    }
});

//make this component available to the app
export default Button;
