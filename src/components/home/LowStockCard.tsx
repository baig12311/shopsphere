import { View, Text, StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import Colors from '../../constants/colors';
import { Image } from 'expo-image';
import fonts, { fontSize } from '../../constants/typography';
import Icon from '../common/Icon';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
interface props {
    title?: string
    stock?: number
    imageurl?: string
    onPress?: () => void
}
const LowStockCard: React.FC<props> = ({ onPress, title, stock, imageurl }) => {

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.7}
            onPress={onPress}
        >
           
            {
                imageurl ? (<Image
                    source={{ uri: imageurl }}
                    style={styles.image}
                />) : (
                    <View style={styles.placeholder}>
                        <Icon
                            name='cube-outline'
                            type='Ionicons'
                            size={wp(5)}
                            color={Colors.primary}
                        />
                    </View>
                )
            }


            <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
            </View>
            <View style={styles.lowIcon}>
                <Icon
                    name='alert-circle'
                    type='Ionicons'
                    size={wp(5)}
                    color={Colors.warning}
                />
                <Text style={styles.lowText} numberOfLines={1}>{stock} left</Text>
            </View>
            
                <Icon
                    name='chevron-small-right'
                    type='Entypo'
                    size={wp(7)}
                    color={Colors.textSecondary}
                />
           



        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: wp(2),
        paddingVertical:hp(1.5),
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 0.3,
        borderColor: Colors.textSecondary,
        //marginBottom: hp(2),
    },

    title: {
        fontFamily: fonts.medium,
        fontSize: fontSize.text,
        color: Colors.text,
        //marginBottom: hp(1)
    },
    text: {
        fontFamily: fonts.medium,
        fontSize: fontSize.text,
        color: Colors.textSecondary,

    },
    image: {
        width: wp(10),
        height: wp(10),
        borderRadius: wp(2)
    },
    placeholder: {
        borderWidth: 0.3,
        width: wp(10),
        height: wp(10),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp(2),
        borderColor: Colors.background,
        backgroundColor: Colors.background,
        //overflow: 'hidden'
    },
    textContainer: {
        flex: 1,
        marginLeft: wp(3)
    },
    lowIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        width: wp(19),

    },
    lowText: {
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color: Colors.warning,
        flexShrink:1
    }

});

//make this component available to the app
export default LowStockCard;
