import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import fonts, { fontSize } from '../../constants/typography';
import Colors from '../../constants/colors';
import OutlineButton from './OutlineButton';
import Button from './Button';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from './Icon';
interface Props {
    //   mainText?: string
    //   subText?: string
    //   illustration?: any
    //   isError?:boolean
    onPress?: () => void

}
const OfflineScreen: React.FC<Props> = ({ onPress }) => {
    return (


        <View style={styles.emptyContainer}>
            <View style={styles.icon}>
                <Icon
                name='wifi-off'
                type='Feather'
                color={Colors.primary}
                size={wp(12)}
            />
            </View>
            

            <Text style={styles.emptyTitle}>No Internet Connection</Text>
            <Text style={styles.emptyText}>Please check your internet connection and try again.</Text>


            <View style={{ width: wp(30) }}>

                <Button title='Retry' onPress={onPress} />



            </View>

        </View>
    );
};

const styles = StyleSheet.create({

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyTitle: {
        fontSize: fontSize.subHeading,
        fontFamily: fonts.bold,
        marginBottom: hp(1.5)
    },

    emptyText: {
        fontSize: fontSize.text,
        fontFamily: fonts.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: hp(5),
    },
    emptyText1: {

    },
    illustration: {
        width: wp(80),
        height: hp(30),
        opacity: 0.5
    },
    icon:{
        width: wp(22),
        height: wp(22),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp(15),
        backgroundColor: Colors.successLight,
        marginBottom: hp(2)
    }
});

//make this component available to the app
export default OfflineScreen;
