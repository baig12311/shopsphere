import { StyleSheet } from "react-native";
import Colors from "../../src/constants/colors";
import fonts, {fontSize} from "../../src/constants/typography";
import { widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from "react-native-responsive-screen";
import StockCard from "../../src/components/inventory/StockCard";
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp(3),
        backgroundColor: Colors.background
    },
    action:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(2)
    },
    productContainer:{
        padding: wp(3),
        marginBottom: hp(2),
        backgroundColor: Colors.surface,
        elevation: 1,
        flexDirection: 'row',
        borderRadius: wp(2)
    },
    image: {
        width: wp(20),
        height: wp(20),
        borderRadius: wp(2),
        borderWidth: 0.5,
        borderColor: Colors.border
    },
    textContainer:{
        marginLeft: wp(3),
        flex:1
    },
    placeholder:{
        width: wp(20),
        height: wp(20),
        borderRadius: wp(2),
        borderWidth: 0.3,
        borderColor: Colors.border,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center'
    },
    name:{
        fontFamily: fonts.bold,
        fontSize: fontSize.text,
        color: Colors.text,
        marginBottom: hp(1)
    },
    stockContainer:{
        elevation:1,
        flex:1,
        borderRadius:wp(2),
        padding:wp(3),
        backgroundColor: Colors.surface
    },
    stockHeading:{
        fontFamily: fonts.bold,
        fontSize:fontSize.text,
        color:Colors.text,
        marginBottom: hp(2)
    },
    containerStyle:{
        flexGrow:1,
        paddingBottom:hp(3)
    }

});
export default styles