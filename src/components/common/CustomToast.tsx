import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import fonts, { fontSize } from '../../constants/typography';
import Colors from '../../constants/colors';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from '../common/Icon';
type toastType = 'success' | 'error'
interface Props {
    messageTitle?: string
    messageDescription?: string
    visible?: boolean
    type?: toastType
    onHide: () => void
}
const CustomToast: React.FC<Props> = ({ messageDescription, messageTitle, visible, onHide, type }) => {
    const toastColor = type === 'success' ? Colors.primary : Colors.error
    // : type === 'warn' ? '#D97706' : '#7C6A9B'
    const icon = type === 'success' ? { name: 'check-circle', type: 'Feather' } : { name: 'error-outline', type: 'MaterialIcons' }
    // type === 'warn' ?
    //     { name: 'alert-triangle', type: 'Feather' } : { name: 'information-circle-outline', type: 'Ionicons' }
    useEffect(() => {
        if (!visible) {
            return
        }
        const timer = setTimeout(() => {
            onHide()
        }, 3000)
        return () => {
            clearTimeout(timer)
        }
    }, [visible, onHide])
    if (!visible) {
        return null
    }
    return (
        <Animated.View
            style={[styles.container, { borderColor: toastColor }]}
            entering={FadeInDown.springify()
                .damping(18)
                .stiffness(180)}
            exiting={FadeOutUp.duration(250)}
        >


            <Icon
                name={icon.name}
                type={icon.type}
                size={wp(5)}
                color={toastColor}
            />
            <View style={styles.textView}>
                <Text style={[styles.txtHeading, { color: toastColor }]}>{messageTitle}</Text>
                <Text style={styles.txtDescription}>{messageDescription}</Text>
            </View>


        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: wp(90),
        alignSelf: 'center',
        borderRadius: wp(2),
        padding: wp(3),
        backgroundColor: 'white',
        zIndex: 10,
        top: hp(6),
        borderLeftWidth: 5,
        elevation: 5,
        flexDirection: 'row'
    },
    txtHeading: {
        fontFamily: fonts.semiBold,
        fontSize: fontSize.text,

        //color: Colors.text
    },
    txtDescription: {
        fontFamily: fonts.regular,
        fontSize: wp(3.2),
        color: Colors.textSecondary,

    },
    textView: {
        marginLeft: wp(2),
        flex: 1,
        marginTop:-3
    }
});

//make this component available to the app
export default CustomToast;
