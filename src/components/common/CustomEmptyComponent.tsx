import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import fonts, { fontSize } from '../../constants/typography';
import Colors from '../../constants/colors';
import OutlineButton from './OutlineButton';
import Button from './Button';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
interface Props {
  mainText?: string
  subText?: string
  illustration?: any
  isError?:boolean
  onPress?:()=>void

}
const CustomEmptyComponent: React.FC<Props> = ({ mainText, subText, illustration, isError, onPress}) => {
  return (


    <View style={styles.emptyContainer}>
      {
        illustration && (
          <Image source={illustration} style={styles.illustration}/>
        )
      }

      <Text style={[styles.emptyTitle, isError && {color:Colors.error}]}>{mainText}</Text>
      <Text style={[styles.emptyText, isError && {color:Colors.error}]}>{subText}</Text>

      {
        isError && (
          <View style={{width: wp(30)}}>
        {
          <Button title='Retry' onPress={onPress} />
        }
        

      </View> 
        )
      }

      {/* */}
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
    width: wp(60),
    height: hp(20),
    opacity: 0.5,
  }
});

//make this component available to the app
export default CustomEmptyComponent;
