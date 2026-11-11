
import { View, Text, StyleSheet,Image} from 'react-native';
import fonts, { fontSize } from '../../constants/typography';
import { getGreeting } from '../../utils/getGreeting';
import Colors from '../../constants/colors';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
interface props {
    userName?: string
    business?: string
    imageurl?: string
}
const Header: React.FC<props> = ({ userName, business, imageurl }) => {
    return (
        <View style={styles.container}>
            {
                imageurl && (
                    <Image
                        style={styles.logo}
                        source={{ uri: imageurl }}
                    />
                )
            }

            <View style={styles.textContainer}>
                <Text style={styles.text} numberOfLines={1}>{getGreeting()} 👋, <Text style={{
                    fontFamily: fonts.extraBold, color: Colors.text
                }}>{userName}</Text></Text>
                <Text style={[styles.text, { fontFamily: fonts.extraBold, color: Colors.text }]} numberOfLines={1}>{business}</Text>
            </View>

            <Image
                source={require('../../../assets/appAssets/logo.png')}
                style={styles.appLogo}
            />



        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        paddingVertical: hp(1),
        marginBottom: hp(2),
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderColor: Colors.border
        //justifyContent: ''
    },
    textContainer: {
        flex: 1,
        paddingRight: wp(5),
        marginLeft: wp(3)
    },
    icon: {
        padding: wp(2),
        backgroundColor: Colors.surface,
        elevation: 1,
        borderRadius: wp(3)
    },
    text: {
        fontFamily: fonts.medium,
        fontSize: fontSize.text,
        color: Colors.textSecondary
    },
    logo: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(7)
    },
    appLogo:{
        width: wp(10),
        height: wp(10),
        borderRadius: wp(7)
    }

});

//make this component available to the app
export default Header;
