
import { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { z } from 'zod';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useToast } from '../../../src/context/ToastContext';
import Colors from '../../../src/constants/colors';
import { supabase } from '../../../src/lib/supabase';
import PasswordRequirements from '../../../src/components/auth/PasswrodCheck';
import Icon from '../../../src/components/common/Icon';
import Input from '../../../src/components/common/Input';
import Button from '../../../src/components/common/Button';
import Header from '../../../src/components/common/Header';
import CustomToast from '../../../src/components/common/CustomToast';
import styles from './ResetStyle';

const passwordSchema = z
    .object({
        password: z
            .string()
            .min(8, '*Password must be at least 8 characters'),
        confirmPassword: z
            .string()
            .min(1, '*Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

const ResetPassword = () => {
    const {showToast} = useToast();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const [loading, setLoading] = useState(false);
    const handleUpdatePassword = async () => {
        if (loading) return;

        setPasswordError('');
        setConfirmPasswordError('');

        const result = passwordSchema.safeParse({
            password,
            confirmPassword,
        });

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;

            setPasswordError(errors.password?.[0] ?? '');
            setConfirmPasswordError(
                errors.confirmPassword?.[0] ?? ''
            );
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password,
            });

            if (error) {
                showToast(
                    'error',
                    'Password Reset Failed',
                    error.message || 'Something went wrong. Please try again.'
                    //'Something went wrong. Please try again.'
                );
                return;
            }

            showToast(
                'success',
                'Password Reset',
                'Your password has been reset successfully.',
            );
            router.replace('/(auth)/login/Login');
        } catch {
            showToast(
                'error',
                    'Password Reset Failed',
                    'Something went wrong. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

   
        

       
            
        
   

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Create Password"
                onPress={() => router.back()}
            />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon
                        name="lock"
                        type="SimpleLineIcons"
                        size={wp(7)}
                        color={Colors.primary}
                    />
                </View>

                <Text style={styles.title}>
                    Create New Password
                </Text>

                <Text style={styles.description2}>
                    Choose a strong password to secure your account.
                </Text>

                <Input
                    title="Password"
                    placeholder="********"
                    iconName="lock"
                    iconType="SimpleLineIcons"
                    value={password}
                    onChangeText={(value: string) => {
                        setPassword(value);
                        setPasswordError('');
                    }}
                    error={passwordError}
                    secure
                />

                <PasswordRequirements password={password} />

                <Input
                    title="Confirm Password"
                    placeholder="********"
                    iconName="lock"
                    iconType="SimpleLineIcons"
                    value={confirmPassword}
                    onChangeText={(value: string) => {
                        setConfirmPassword(value);
                        setConfirmPasswordError('');
                    }}
                    error={confirmPasswordError}
                    secure
                />

                <View style={styles.button}>
                    <Button
                        title="Reset Password"
                        onPress={handleUpdatePassword}
                        disabled={
                            !password ||
                            !confirmPassword ||
                            loading
                        }
                        isLoading={loading}
                    />
                </View>
            </View>

            
        </SafeAreaView>
    );
};

export default ResetPassword;
