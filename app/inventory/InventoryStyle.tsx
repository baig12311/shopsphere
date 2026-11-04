import { StyleSheet } from "react-native";
import fonts, {fontSize} from "../../src/constants/typography";
import Colors from "../../src/constants/colors";
import { widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from "react-native-responsive-screen";
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: wp(3)
    },
    inventoryRow:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(2)
    },
    containerStyle:{
        flexGrow: 1, 
        paddingBottom: hp(6)
    },
    flatlist:{
        borderRadius: wp(2),
        backgroundColor: Colors.surface,
        elevation:1
    },
    sectionTitle: {
        fontFamily: fonts.bold,
        fontSize: fontSize.subHeading,
        marginBottom: hp(0.5),
        color: Colors.text
    },
});
export default styles
