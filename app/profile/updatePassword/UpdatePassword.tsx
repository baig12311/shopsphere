import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { z } from 'zod';

import styles from './UpdateStyle';
import { supabase } from '../../../src/lib/supabase';
import Input from '../../../src/components/common/Input';
import Button from '../../../src/components/common/Button';
import Header from '../../../src/components/common/Header';
import PasswordRequirements from '../../../src/components/auth/PasswrodCheck';
import { useToast } from '../../../src/context/ToastContext';
const updatePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, '*Enter your current password'),

        newPassword: z
            .string()
            .min(8, '*Password must be at least 8 characters'),

        confirmNewPassword: z
            .string()
            .min(1, '*Please confirm your new password'),
    })
    .refine(
        (data) => data.newPassword === data.confirmNewPassword,
        {
            message: '*Passwords do not match',
            path: ['confirmNewPassword'],
        }
    )
    .refine(
        (data) => data.currentPassword !== data.newPassword,
        {
            message: '*New password must be different from current password',
            path: ['newPassword'],
        }
    );

const UpdatePassword = () => {
    const { showToast } = useToast()
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [updating, setUpdating] = useState(false);

    const [errors, setErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });



    const isDisabled =
        !currentPassword.trim() ||
        !newPassword ||
        !confirmNewPassword;



    const handleSave = async () => {
        if (updating) return;

        setErrors({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        });

        const result = updatePasswordSchema.safeParse({
            currentPassword,
            newPassword,
            confirmNewPassword,
        });

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;

            setErrors({
                currentPassword:
                    fieldErrors.currentPassword?.[0] ?? '',
                newPassword:
                    fieldErrors.newPassword?.[0] ?? '',
                confirmNewPassword:
                    fieldErrors.confirmNewPassword?.[0] ?? '',
            });

            return;
        }

        setUpdating(true);

        try {
            const { error } = await supabase.auth.updateUser({
                current_password: currentPassword,
                password: newPassword,
            });

            if (error) {
                showToast(
                    'error',
                    'Unable to Change Password',
                    "We couldn't change password. Please try again."
                );
                return;
            }

            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

            setErrors({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });

            showToast(
                'success',
                'Password Updated',
                'Password has been changed successfully.',

            );
            router.back();
        } catch {
            showToast(
                'error',
                'Unable to Change Password',
                "We couldn't change password. Please try again."
            );
        } finally {
            setUpdating(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Update Password"
                onPress={() => router.back()}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.heading}>
                        Choose a New Password
                    </Text>
                    <Text style={styles.subHeading}>
                        Change your password to keep your accout secure.
                    </Text>

                    <Input
                        title="Current Password"
                        placeholder="********"
                        value={currentPassword}
                        onChangeText={(value: string) => {
                            setCurrentPassword(value);
                            if (errors.currentPassword) {
                                setErrors((prev) => ({
                                    ...prev,
                                    currentPassword: '',
                                }));
                            }
                        }}
                        secure
                        error={errors.currentPassword}
                        isEditable={!updating}
                    />

                    <Input
                        title="New Password"
                        placeholder="********"
                        value={newPassword}
                        onChangeText={(value: string) => {
                            setNewPassword(value);
                            if (errors.newPassword) {
                                setErrors((prev) => ({
                                    ...prev,
                                    newPassword: '',
                                }));
                            }
                        }}
                        secure
                        error={errors.newPassword}
                        isEditable={!updating}
                    />

                    <PasswordRequirements password={newPassword} />

                    <Input
                        title="Confirm New Password"
                        placeholder="********"
                        value={confirmNewPassword}
                        onChangeText={(value: string) => {
                            setConfirmNewPassword(value);
                            if (errors.confirmNewPassword) {
                                setErrors((prev) => ({
                                    ...prev,
                                    confirmNewPassword: '',
                                }));
                            }
                        }}
                        secure
                        error={errors.confirmNewPassword}
                        isEditable={!updating}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.buttonContainer}>
                <Button
                    title="Update Password"
                    onPress={handleSave}
                    disabled={isDisabled || updating}
                    isLoading={updating}
                />
            </View>


        </SafeAreaView>
    );
};

export default UpdatePassword;