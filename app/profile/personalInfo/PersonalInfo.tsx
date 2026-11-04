import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Colors from '../../../src/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUser } from '../../../src/hooks/useUser';
import { useUpdateUserName } from '../../../src/hooks/useUpdateUsername';
import CustomEmptyComponent from '../../../src/components/common/CustomEmptyComponent';
import Header from '../../../src/components/common/Header';
import styles from './personalStyle';
import Input from '../../../src/components/common/Input';
import Button from '../../../src/components/common/Button';
import { useToast } from '../../../src/context/ToastContext';
const PersonalInfo = () => {
    const { showToast } = useToast()
    const { data, isLoading, error: userError, refetch: userRefetch } = useUser()
    const { mutateAsync: updateMutation, isPending: updating } = useUpdateUserName()
    const userName = data?.user_metadata?.name
    const email = data?.email || 'No Email'
    const [showInput1, setShowInput1] = useState(false)
    const [newName, setNewName] = useState('')


    useEffect(() => {
        if (data) {
            setNewName(userName ?? '')
        }
    }, [data])
    const isNameChanged = newName.trim() !== (userName ?? '').trim()
    const disabled = isLoading || !newName.trim() || !isNameChanged
    const handleSave = async () => {
        const Name = newName.trim()
        try {
            await updateMutation(Name)
            showToast(
                'success',
                'Details Updated',
                'Personal details have been updated successfully.'
            )
            router.back()

        } catch (error) {
            showToast(
                'error',
                'Unable to Update',
                "We couldn't update personal details. Please try again."
            )
        }
    }


    const handleRetry = async () => {
        await userRefetch()
    }
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Personal Information' onPress={() => router.back()} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size='large' color={Colors.primary} />
                </View>
            </SafeAreaView>
        )

    }


    if (userError) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Personal Information' onPress={() => router.back()} />

                <CustomEmptyComponent
                    isError={true}


                    mainText='Something Went Wrong'
                    subText='Unable to load data. Please try again.'
                    onPress={handleRetry}
                />

            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title='Personal Information' onPress={() => router.back()} />
            <View style={{ flex: 1 }}>
                <Text style={styles.subHeading}>Manage you personal details</Text>
                <Input
                    title='Full Name'
                    placeholder=''
                    value={newName}
                    onChangeText={setNewName}
                    isEditable={showInput1}
                    onPressEdit={() => setShowInput1(true)}
                    autoFocus={showInput1}
                    onBlur={() => setShowInput1(false)}
                />
            </View>
            {
                isNameChanged && (
                    <View style={styles.buttonContainer}>
                        <Button
                            title='Save Changes'
                            onPress={handleSave}
                            disabled={disabled}
                            isLoading={updating}
                        />
                    </View>
                )
            }

        </SafeAreaView>
    );
};

export default PersonalInfo;
