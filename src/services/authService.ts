import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';

import { router } from 'expo-router';
export const logout = async () => {
    const { error } = await supabase.auth.signOut({
    scope: 'local',
});

    if (error) {
        throw error;
    }
    router.replace('/OnBoard')
};




// export const getCurrentUser = async () => {
//     const { data: sessionData, error: sessionError } =
//         await supabase.auth.getSession();

//     if (!sessionData.session) {
//         return null;
//     }

//     const {
//         data: { user },
//         error,
//     } = await supabase.auth.getUser();

//     if (error) {
//         throw error;
//     }

//     return user;
// };


export const getCurrentUser = async () => {
    const {
        data: sessionData,
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
        throw sessionError;
    }

    if (!sessionData.session) {
        return null;
    }

    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    return user;
};


// forgot password 


export const sendPasswordResetEmail = async (email: string) => {
    const redirectTo = Linking.createURL('callback', {
        queryParams: {
            flow: 'recovery',
        },
    });

    console.log('Password reset redirect:', redirectTo);

    const { data, error } =
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        console.log('RESET ERROR:', error);
        console.log('RESET DATA:', data);
    if (error) {
        throw error;
    }

    return data;
};