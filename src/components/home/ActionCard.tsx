
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import fonts, { fontSize } from '../../constants/typography';
import Colors from '../../constants/colors';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import Icon from '../common/Icon';
interface props{
    iconName:string
    iconType:string
    title:string
    onPress?:()=>void
}
const ActionCard:React.FC<props> = ({iconName, iconType, title, onPress}) => {
    return (
        <TouchableOpacity 
        style={styles.container}
        activeOpacity={0.7}
        onPress={onPress}
        >
            <Icon
            name={iconName}
            type={iconType}
            size={wp(6)}
            color={Colors.primary}
            />

            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: wp(29),
        paddingVertical: hp(1),
        backgroundColor: Colors.surface,
        elevation:1,
        borderRadius:wp(3),
        alignItems: 'center',
        
        paddingHorizontal:wp(1)
    },
    text:{
        fontFamily:fonts.semiBold,
        fontSize: fontSize.smallText,
        //textAlignVertical: 'center',
        color: Colors.text,
        marginTop: hp(0.5),
        textAlign: 'center',
        //flex:1,
        //textAlignVertical: 'center'
    }
});

export default ActionCard;
