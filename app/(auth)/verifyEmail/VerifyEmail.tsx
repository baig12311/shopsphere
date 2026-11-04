
import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from '../../../src/constants/colors';
import styles from './verifyStyle';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as Linking from 'expo-linking';
import Button from '../../../src/components/common/Button';
import { supabase } from '../../../src/lib/supabase';

import Icon from '../../../src/components/common/Icon';


const VerifyEmail = () => {
    const { email, flow} = useLocalSearchParams<{ email: string, flow?:string}>();
    const isRecovery = flow === 'recovery'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

   
const handleResendEmail = async () => {
    if (!email || loading) return;

    setLoading(true);
    setMessage('');

    try {
        const { error } = isRecovery
            ? await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: Linking.createURL('callback', {
                      queryParams: { flow: 'recovery' },
                  }),
              })
            : await supabase.auth.resend({
                  type: 'signup',
                  email,
                  options: {
                      emailRedirectTo: Linking.createURL('callback'),
                  },
              });

        if (error) {
            setIsError(true);
            setMessage(
                isRecovery
                    ? 'Unable to send the reset email. Please try again.'
                    : error.message
            );
        } else {
            setIsError(false);
            setMessage(
                isRecovery
                    ? 'Password reset email sent. Please check your inbox.'
                    : 'Verification email sent. Please check your inbox.'
            );
        }
    } catch {
        setIsError(true);
        setMessage('Something went wrong. Please try again.');
    } finally {
        setLoading(false);
    }
};


    return (
        <SafeAreaView style={styles.container}>
           
                <View style={styles.iconContainer}>
                    <Icon
                    name='mail-outline'
                    type='Ionicons'
                    size={wp(8)}
                    color={Colors.primary}
                    />
                </View>

                <Text style={styles.title}>{isRecovery ? 'Reset your password' : 'Verify your email'}</Text>

                <Text style={styles.description}>
                    {isRecovery
        ? 'We have sent a password reset link to your email address. Open the link to reset your password.'
        : "We've sent a verification link to your email address. Please verify your email to continue setting up your business."}
                </Text>

                <View style={styles.emailCard}>
                    <Text style={styles.emailLabel}>
                        {isRecovery ? 'Password reset email sent to' : 'Verification email sent to'}
                        </Text>
                    <Text style={styles.emailText}>{email || 'Your email address'}</Text>
                </View>

                {message ? (
                    <Text
                        style={[
                            styles.message,
                            { color: isError ? Colors.error : Colors.primary },
                        ]}
                    >
                        {message}
                    </Text>
                ) : null}
                <View style={styles.button}>
                     <Button
                title={isRecovery ? 'Resend Reset Email' : 'Resend Verification Email'}
                disabled={loading}
                onPress={handleResendEmail}
                isLoading={loading}
                />
                </View>
               

               

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace('/(auth)/login/Login')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backButtonText}>
                        Back to Sign In
                    </Text>
                </TouchableOpacity>

                <Text style={styles.footer}>
                    Can't find the email? Check your spam or junk folder.
                </Text>
           
        </SafeAreaView>
    );
};

export default VerifyEmail;

