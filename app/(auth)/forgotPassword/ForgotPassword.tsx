import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '../../../src/constants/colors';
import { sendPasswordResetEmail } from '../../../src/services/authService';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from '../../../src/components/common/Icon';
import Input from '../../../src/components/common/Input';
import Button from '../../../src/components/common/Button';
import Header from '../../../src/components/common/Header';
import styles from './forgotStyle';
import { z } from 'zod'
// schema
const forgotSchema = z.object({
    email: z.email('*Please enter valid email')
})
const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [emailError, setEmailError] = useState('')
    const handleEmailChange = (value: string) => {
        setEmail(value);

        if (emailError) {
            setEmailError('');
        }
    };

    // const handle send
    const handleSend = async () => {
        const result = forgotSchema.safeParse({
            email,
        });

        if (!result.success) {
            setEmailError(result.error.issues[0].message);
            return;
        }

        try {
            setLoading(true)
            const result=await sendPasswordResetEmail(email)
            if(result)
            {
                router.push({
                    pathname: '/verifyEmail/VerifyEmail',
                    params:{
                        email: email,
                        flow:'recovery'
                    }
                })
            }
        } catch (error) {
            
        }
        finally{
            setLoading(false)
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <Header title='Forgot Password' onPress={() => router.back()} />
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon
                        name='lock'
                        type='SimpleLineIcons'
                        size={wp(7)}
                        color={Colors.primary}
                    />
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.description}>No worries. We'll help you reset your password</Text>

                <Text style={styles.description2}>
                    Enter your registered email below. We'll send reset link to your email.
                </Text>
                <Input
                    title='Registered Email'
                    placeholder='someone@example.com'
                    iconName='mail-outline'
                    iconType='Ionicons'
                    value={email}
                    onChangeText={handleEmailChange}
                    error={emailError}
                />
                <View style={styles.button}>
                    <Button
                        title='Send Reset Link'
                        disabled={!email}
                        onPress={handleSend}
                        isLoading={loading}
                    />
                </View>

                <Text style={styles.rememText}>Remember your password?
                    <Text style={styles.textPress} onPress={() => router.push('/login/Login')}>
                        {` `}Log in</Text>
                </Text>

            </View>

        </SafeAreaView>
    );
};



export default ForgotPassword;
