import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Colors from '../../constants/colors';
import fonts, { fontSize } from '../../constants/typography';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
interface props{
    onSelect: (value:any)=>void
    value?:string
    viewOrder?:boolean
}
const OrderSourceSelector:React.FC<props> = ({onSelect, value, viewOrder}) => {
    return (
        <View style={styles.container}>
            {
                viewOrder && (
               <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.button, value === 'all' && {backgroundColor:Colors.primary}]}
            onPress={()=>onSelect('all')}
            >
                <Text style={[styles.btnText, value === 'all' && {color:Colors.surface}]}>
                    All
                </Text>
            </TouchableOpacity>     
                )
            }
            <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.button, value === 'online' && {backgroundColor:Colors.primary}]}
            onPress={()=>onSelect('online')}
            >
                <Text style={[styles.btnText, value === 'online' && {color:Colors.surface}]}>
                    Online
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.button, value === 'physical' && {backgroundColor:Colors.primary}]}
            onPress={()=>onSelect('physical')}
            >
                <Text style={[styles.btnText, value === 'physical' && {color:Colors.surface}]}>
                    Physical
                </Text>
            </TouchableOpacity>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        elevation:1,
        borderWidth:1,
        borderColor:Colors.surface,
        padding: wp(1),
        justifyContent: 'space-between',
        borderRadius: wp(2),
        gap:20,
        backgroundColor: Colors.surface,
        marginBottom: hp(2)
        //width: wp(60)
    },
    button:{
        flex:1,
        alignItems: 'center',
        paddingVertical: hp(1),
        borderRadius: wp(1),
        //backgroundColor: Colors.background
    },
    btnText:{
        fontFamily: fonts.semiBold,
        fontSize: fontSize.text,
        color: Colors.textSecondary
    },
    
});

//make this component available to the app
export default OrderSourceSelector;
