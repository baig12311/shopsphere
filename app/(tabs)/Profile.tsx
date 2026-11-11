import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '../../src/constants/colors';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { logout } from '../../src/services/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import OutlineButton from '../../src/components/common/OutlineButton';
import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import Header from '../../src/components/common/Header';
import CustomSectionRow from '../../src/components/profile/CustomSectionRow';
import ProfileInfoCard from '../../src/components/profile/ProfileInfoCard';
import { currencies } from '../../src/services/data/currencies';
import ConfirmationDialog from '../../src/components/common/ConfirmationDialog';
import SignOut from '../../src/components/profile/SignoutButton';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import fonts, { fontSize } from '../../src/constants/typography';
const Profile = () => {
    const appVersion = Constants.expoConfig?.version ?? '1.0.0';
    const [showDialog, setShowDialog] = useState(false)
    const [showAccountDialog, setShowAccountDialog] = useState(false)
    const { data, isLoading } = useUser()
    const { data: business, isLoading: businessLoading } = useBusiness(data?.id)
    const currency = business?.currency || '---'
    const currencyName =currency ? currencies.find(item =>
        item.code === currency)?.name || '' : 'Offline'
    const userName = data?.user_metadata?.name || 'User'
    const email = data?.email || 'Ofline (No Email)'
    return (
        <SafeAreaView style={styles.container}>
            <Header title='Profile' onPress={() => router.replace('/Home')}/>
                {
                    showDialog && (
                        <ConfirmationDialog
                        iconName='log-out-outline'
                        modalVisible={showDialog}
                        txtButton='Log Out'
                        txtCancel='Stay Logged In'
                        title='Log Out?'
                        msg='Are you sure you want to log out to your account?'
                        onPressDelete={logout}
                        onPressCancel={()=>setShowDialog(false)}
                        />
                    )
                }
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.heading}>Hi, <Text style={{fontSize: fontSize.heading, fontFamily:fonts.extraBold}}>{userName}</Text></Text>
                <Text style={styles.subHeading}>Manage your account and business details</Text>
                <ProfileInfoCard name={userName} email={email} />
                {/* section personal */}
                <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
                <View style={styles.section}>
                    <CustomSectionRow
                        mainText='Personal Details'
                        subText='Manage your personal details'
                        iconName='person-outline'
                        iconType='Ionicons'
                        paddingVertical={hp(1)}
                        borderBottomWidth={0.3}
                        onPress={()=>router.push('/profile/personalInfo/PersonalInfo')}
                    />
                    <CustomSectionRow
                        mainText='Change Password'
                        subText='Update your account password'
                        iconName='lock'
                        iconType='SimpleLineIcons'
                        paddingVertical={hp(1)}
                        onPress={()=>router.push('/profile/updatePassword/UpdatePassword')}
                    />
                </View>


                {/* section Business */}

                <Text style={styles.sectionTitle}>BUSINESS INFORMATION</Text>
                <View style={styles.section}>
                    <CustomSectionRow
                        mainText='Business Details'
                        subText='Business name and category'
                        iconName='storefront-outline'
                        iconType='Ionicons'
                        paddingVertical={hp(1)}
                        borderBottomWidth={0.3}
                        onPress={()=>router.push('/profile/businessInfo/BusinessInfo')}

                    />
                    <CustomSectionRow
                        mainText='Currency'
                        subText={`${currency} - ${currencyName}`}
                        iconName='cash-outline'
                        iconType='Ionicons'
                        paddingVertical={hp(1)}
                        isDisabled={true}
                    />
                </View>

                {/* account section */}

                <Text style={styles.sectionTitle}>ACCOUNT</Text>
                <View style={styles.section}>
                    <CustomSectionRow
                        mainText='Log Out'
                        subText='Log out of your account'
                        iconName='log-out-outline'
                        iconType='Ionicons'
                        paddingVertical={hp(1)}
                        borderBottomWidth={0.3}
                        onPress={()=>setShowDialog(true)}
                    />
                    <CustomSectionRow
                        mainText='Delete Account'
                        subText='Permanently delete your account'
                        iconName='trash-outline'
                        iconType='Ionicons'
                        paddingVertical={hp(1)}
                        onPress={()=>router.push('/profile/deleteAccount/DeleteAccount')}
                        //onPress={()=>setShowAccountDialog(true)}
                    />
                </View>
                <View style={{marginTop: hp(4)}}>
                    <Text style={styles.version}>
                    ShopSphere
                </Text>
                <Text style={styles.version}>
                    Version {appVersion}
                </Text>
                </View>
                
                {/* <SignOut
                onPress={logout}
            /> */}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {

        backgroundColor: Colors.background,
        padding: wp(3),
        flex: 1
    },
    heading: {
        fontFamily: fonts.bold,
        fontSize: fontSize.subHeading,
        color: Colors.text
    },
    subHeading: {
        fontFamily: fonts.medium,
        fontSize: fontSize.text,
        color: Colors.textSecondary,
        marginBottom: hp(4)
    },
    section: {
        backgroundColor: Colors.surface,
        borderRadius: wp(2),
        padding: wp(3),
        marginBottom: hp(2),
        elevation: 1
    },
    sectionTitle: {
        fontFamily: fonts.bold,
        fontSize: fontSize.text,
        marginBottom: hp(1),
        color: Colors.textSecondary
    },
    scroll: {
        paddingBottom: hp(3),
        flexGrow: 1
    },

    version:{
        fontFamily: fonts.medium,
        fontSize: fontSize.smallText,
        color:Colors.textSecondary,
        textAlign: 'center',
    }
});

//make this component available to the app
export default Profile;




