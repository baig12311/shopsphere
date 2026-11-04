import { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform, TouchableOpacity,
    ActivityIndicator,
    Image
}
    from 'react-native';
import styles from './BusinessInfoStyle';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../../src/components/common/Input';
import SelectInput from '../../../src/components/common/SelectInput';
import Button from '../../../src/components/common/Button';
import CustomEmptyComponent from '../../../src/components/common/CustomEmptyComponent';
import { useBusiness } from '../../../src/hooks/useBusiness';
import { parsePhoneNumberFromString, CountryCode, PhoneNumber } from 'libphonenumber-js';
import { takePhoto, pickFromLibrary } from '../../../src/services/imagePicker';
import { supabase } from '../../../src/lib/supabase';
import { useUser } from '../../../src/hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { uploadImage } from '../../../src/services/convertImage';
import Icon from '../../../src/components/common/Icon';
import Colors from '../../../src/constants/colors';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Header from '../../../src/components/common/Header';
import PhoneInput from '../../../src/components/common/PhoneInput';
import ImageSheet from '../../../src/components/uploadImage/ImageSheet';
import BusinessType from '../../../src/components/common/BusinessType';
import { countries } from '../../../src/services/data/countries';
import { businessSchema } from '../../../src/services/schema/businessSchema';
import CustomBottomSheet from '../../../src/components/common/CustomBottomSheet';
import { useToast } from '../../../src/context/ToastContext';
import BottomSheet from '@gorhom/bottom-sheet';
import { currencies } from '../../../src/services/data/currencies';
import { businessCategories } from '../../../src/services/data/categories';

type currency = {
    code: string
    name: string
    symbol: string
    flag: string
}
type selected = {
    name: string,
    flag: string,
    dialCode: string
    code: CountryCode
}
const BusinessSetup = () => {
    const { showToast } = useToast()
    const queryClient = useQueryClient();

    const { data: user, isLoading: userLoading, error: userError, refetch: userRefetch } = useUser()
    const { data: business, isLoading: businessLoading, error: businessError, refetch: businessRefetch } = useBusiness(user?.id)
    const isLoadingData = userLoading || businessLoading
    const isErrorFetching = userError || businessError
    const [loading, setLoading] = useState(false)
    const [businessType, setBusinessType] = useState('')
    const [displayKeys, setDisplayKeys] = useState<string[]>([])
    const [placeholder, setPlaceholder] = useState('')
    const [category, setCategory] = useState('')
    const [selectedCountry, setSelectedCountry] = useState<selected>(countries[0])
    const [currency, setCurrency] = useState<currency | null>(null)
    const [businessName, setBusinessName] = useState('')
    const [number, setNumber] = useState('')
    const [image, setImage] = useState<string | null>(null)
    const [imageSheet, setShowImageSheet] = useState(false)
    const [showSheet, setShowSheet] = useState(false)
    const [sheetTitle, setSheetTitle] = useState('');
    const [sheetOptions, setSheetOptions] = useState<any[]>([]);
    const [sheetValue, setSheetValue] = useState('');
    const sheetRef = useRef<BottomSheet>(null)
    const imageSheetRef = useRef<BottomSheet>(null)
    const [showName, setShowName] = useState(false)
    const [showNumber, setShowNumber] = useState(false)
    const [showCategory, setShowCategory] = useState(false)
    const [showType, setShowType] = useState(false)
    const [businessTypeError, setBusinessTypeError] = useState('')
    const closeAllEditModes = () => {
        setShowName(false);
        setShowNumber(false);
        setShowCategory(false);
        setShowType(false);
    };
    const businessText = business?.business_type === 'online' ? {
        title: 'Online',
        subText: 'Whatsapp, Instagram online orders'
    } :
        business?.business_type === 'physical' ? { title: 'Physical', subText: 'Counter Sale' } :
            { title: 'Both', subText: 'Online & Physical Orders' }
    const [errors, setErrors] = useState<{
        businessName?: string;
        number?: string;
        currency?: string;
        category?: string
    }>({})
    const isDisabled = !businessName || !category || !currency || !number
    useEffect(() => {
        if (business) {
            const phoneNumber = parsePhoneNumberFromString(
                business.whatsapp_number ?? ''
            );

            if (phoneNumber) {
                const selectedCountry = countries.find(
                    item => item.code === phoneNumber.country
                );

                if (selectedCountry) {
                    setSelectedCountry(selectedCountry);
                }

                setNumber(phoneNumber.nationalNumber)
            }
            setImage(business.logo_url ?? '')
            setBusinessName(business?.name ?? '')
            setCategory(business?.category ?? '')
            setBusinessType(business?.business_type ?? '')
        }
    }, [business])

    // comparing changes
    const originalName = business?.name ?? '';
    const originalCategory = business?.category ?? '';
    const originalType = business?.business_type ?? ''
    const originalImage = business?.logo_url ?? '';
    const originalNumber =
        parsePhoneNumberFromString(
            business?.whatsapp_number ?? ''
        )?.nationalNumber ?? '';

    const nameChanged =
        businessName.trim() !== '' &&
        businessName.trim() !== originalName;

    const categoryChanged =
        category.trim() !== '' &&
        category !== originalCategory;

    const numberChanged =
        number.trim() !== '' &&
        number !== originalNumber;

    const typeChanged =
        businessType.trim() !== '' &&
        businessType !== originalType

    const imageChanged = image !== originalImage;

    const hasChanges =
        nameChanged || categoryChanged || numberChanged || typeChanged || imageChanged;

    const isEditing =
        showName || showNumber || showCategory || showType;

    const showSaveButton = hasChanges;
    // Open Sheet
    const openSheet = (
        title: string,
        options: any[],
        value: any,
        keys: string[] = [],
        placeholder: string
    ) => {

        setPlaceholder(placeholder)
        setSheetTitle(title);
        setSheetOptions(options);
        setSheetValue(value);
        setDisplayKeys(keys)
        sheetRef.current?.snapToIndex(0);
    };

    // Select Value Handler
    const handleSelect = (value: any) => {
        if (sheetTitle === 'Select Category') {
            setCategory(value);
        }
        if (sheetTitle === 'Select Currency') {
            setCurrency(value);
        }
        if (sheetTitle === 'Select Country Code') {

            setSelectedCountry(value)
        }
        sheetRef.current?.close();
        setShowSheet(false);
    };

    // handle image action
    const handleImageAction = async (action: 'camera' | 'gallery' | 'remove') => {
        imageSheetRef.current?.close()
        if (action === 'camera') {
            const imageUri = await takePhoto()
            if (imageUri) {
                setImage(imageUri);
            }
        }
        else if (action === 'gallery') {
            const imageUri = await pickFromLibrary()
            if (imageUri) {
                setImage(imageUri);
            }
        }
        // else if (action === 'remove') {
        //     await removeImage()
        // }
    }

    // Hande Update Business
    const handleUpdateBusiness = async () => {
        if (!business || !user || !hasChanges) return;

        setLoading(true);
        setErrors({});

        try {
            const updates: {
                name?: string;
                category?: string;
                whatsapp_number?: string;
                logo_url?: string;
                business_type?: string;
            } = {};

            // Update only changed, non-empty fields
            if (businessName.trim() !== '' && nameChanged) {
                updates.name = businessName.trim();
            }

            if (category.trim() !== '' && categoryChanged) {
                updates.category = category;
            }

            if (number.trim() !== '' && numberChanged) {
                const phoneNumber = parsePhoneNumberFromString(
                    number,
                    selectedCountry.code
                );

                if (!phoneNumber?.isValid()) {
                    setErrors({
                        number: '*Please enter a valid phone number',
                    });
                    return;
                }

                updates.whatsapp_number = phoneNumber.number;
            }

            if (businessType.trim() !== '' && businessType !== business.business_type) {
                updates.business_type = businessType;
            }

            // Keep the image upload functionality
            if (image && image !== business.logo_url) {
                const imageUrl = await uploadImage(
                    image,
                    'business-logos',
                    user.id
                );

                if (!imageUrl) {
                    throw new Error('Business logo upload failed');
                }

                updates.logo_url = imageUrl;
            }

            if (Object.keys(updates).length === 0) return;

            const { error } = await supabase
                .from('businesses')
                .update(updates)
                .eq('id', business.id)
                .eq('owner_id', user.id);

            if (error) {
                throw error;
            }

            // Refresh business data here using your useBusiness query key
            // For example: queryClient.invalidateQueries(...)
            await queryClient.invalidateQueries({
                queryKey: ['business', user.id],
            });
            showToast(
                'success',
                'Business Updated',
                'Business details have been updated successfully.'
            )
            closeAllEditModes()
            router.back()

        } catch (error) {

            showToast(
                'error',
                'Unable to Update',
                "We couldn't update business details. Please try again."
            )
        } finally {
            setLoading(false);
        }
    };


    const handleRetry = async () => {
        await userRefetch()
        await businessRefetch()
    }
    if (isLoadingData) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Business Information'
                    //noBack={true}
                    onPress={() => router.back()} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size='large' color={Colors.primary} />
                </View>
            </SafeAreaView>
        )

    }


    if (isErrorFetching) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title='Business Information' onPress={() => router.back()} />

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
        <View style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <Header title='Business Information'
                        //noBack={true}
                        onPress={() => router.back()} />
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.sub}>Manage your business details</Text>
                        <View style={styles.logoContainer}>
                            {
                                image ? (
                                    <Image
                                        style={styles.image}
                                        source={{ uri: image }}
                                    />
                                ) : (<TouchableOpacity
                                    style={styles.uploadImage}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        setShowImageSheet(true),
                                            imageSheetRef.current?.snapToIndex(0)
                                    }}
                                >
                                    <Icon
                                        name='upload-file'
                                        type='MaterialIcons'
                                        color={Colors.primary}
                                        size={wp(10)}

                                    />
                                </TouchableOpacity>)

                            }
                            {
                                image ? (
                                    <TouchableOpacity
                                        style={styles.row}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            setShowImageSheet(true),
                                                imageSheetRef.current?.snapToIndex(0)
                                        }}
                                    >
                                        <Icon
                                            name='edit'
                                            type='Feather'
                                            size={wp(5)}
                                            color={Colors.primary}
                                        />

                                        <Text style={[styles.rowText, { color: Colors.primary }]}>Change logo</Text>

                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.uploadText}>Upload business logo</Text>
                                )
                            }
                        </View>
                        <Input
                            title='Business Name'
                            placeholder='John Traders'
                            // iconName='storefront-outline'
                            // iconType='Ionicons'
                            autoFocus={showName}
                            value={businessName}
                            isEditable={showName}
                            onPressEdit={() => { closeAllEditModes(), setShowName(true) }}
                            onBlur={() => setShowName(false)}
                            onChangeText={(text: string) => {
                                setBusinessName(text),
                                    setErrors({
                                        ...errors,
                                        businessName: undefined
                                    })
                            }}
                            error={errors.businessName}
                        />
                        {
                            showCategory ? (
                                <SelectInput
                                    title='Category'
                                    //placeholder='Select Category'
                                    value={category}
                                    error={errors.category}
                                    onPress={() => {
                                        setShowSheet(true)
                                        openSheet(
                                            'Select Category',
                                            businessCategories,
                                            category,
                                            [],
                                            'category'

                                        )
                                    }}
                                />
                            ) : (
                                <Input
                                    title='Category'
                                    value={category}
                                    onPressEdit={() => { closeAllEditModes(), setShowCategory(true) }}
                                    isEditable={showCategory}
                                />
                            )
                        }

                        {
                            showNumber ? (
                                <PhoneInput
                                    onChangeCode={() => {
                                        setShowSheet(true),
                                            openSheet(
                                                'Select Country Code',
                                                countries,
                                                selectedCountry,
                                                ['flag', 'name', 'dialCode'],
                                                'code by country name'

                                            )
                                    }}
                                    valueCode={selectedCountry.dialCode}
                                    flag={selectedCountry?.flag}
                                    valueNumber={number}
                                    onChangeNumber={(t: string) => {
                                        setNumber(t)
                                        setErrors({
                                            ...errors,
                                            number: undefined,
                                        });
                                    }}
                                    errorMessage={errors.number}
                                    isEditable={showNumber}
                                    autoFocus={showNumber}
                                    //onPressEditNumber={() => {setShowNumber(true), closeAllEditModes}}
                                    onBlur={() => setShowNumber(false)}
                                />
                            ) : (<Input
                                title='Phone Number'
                                value={business?.whatsapp_number}
                                onPressEdit={() => { closeAllEditModes(), setShowNumber(true) }}
                                isEditable={showNumber}
                            />)
                        }

                        <Text style={styles.title}>Business Type</Text>
                        {/* business type */}

                        {
                            showType ? (
                                <>
                                    <BusinessType
                                        title='Online'
                                        subText='Whatsapp, Instagram online orders'
                                        iconName='phone-portrait-outline'
                                        iconType='Ionicons'
                                        selected={businessType === 'online'}
                                        isEdit={showType}
                                        onPress={() => { setBusinessType('online'), setBusinessTypeError('') }}
                                    />
                                    <BusinessType
                                        title='Physical Shop'
                                        subText='Counter Sale'
                                        iconName='storefront-outline'
                                        iconType='Ionicons'
                                        selected={businessType === 'physical'}
                                        isEdit={showType}
                                        onPress={() => { setBusinessType('physical'), setBusinessTypeError('') }}
                                    />
                                    <BusinessType
                                        title='Both'
                                        subText='Online & Physical orders'
                                        iconName='bag-outline'
                                        iconType='Ionicons'
                                        selected={businessType === 'both'}
                                        isEdit={showType}
                                        onPress={() => { setBusinessType('both'), setBusinessTypeError('') }}
                                    />
                                </>
                            ) : (
                                <BusinessType
                                    title={businessText.title}
                                    subText={businessText.subText}
                                    iconName='phone-portrait-outline'
                                    iconType='Ionicons'
                                    selected={businessType === 'online'}
                                    isEdit={showType}
                                    onPressEdit={() => setShowType(true)}
                                    onPress={() => { setBusinessType('online'), setBusinessTypeError('') }}
                                />
                            )
                        }

                        <Text style={styles.error}>{businessTypeError}</Text>
                        {
                            showSaveButton && (
                                <View style={styles.button}>
                                    <Button
                                        title='Save Changes'
                                        onPress={handleUpdateBusiness}
                                        isLoading={loading}
                                        disabled={loading}
                                    />
                                </View>
                            )
                        }




                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
            {
                showSheet && (
                    <CustomBottomSheet
                        bottomSheetRef={sheetRef}
                        searchable={true}
                        searchPlaceholder={placeholder}
                        //displayKeys={['flag', 'name', 'code']}
                        displayKeys={displayKeys && displayKeys}
                        options={sheetOptions}
                        title={sheetTitle}
                        onSelect={handleSelect}
                    //value=
                    />
                )

            }
            {
                imageSheet && (
                    <ImageSheet
                        bottomSheetRef={imageSheetRef}
                        onAction={handleImageAction}
                        isEdit={image ? true : false}
                    //value=
                    />
                )
            }
        </View>

    );
};

export default BusinessSetup;
