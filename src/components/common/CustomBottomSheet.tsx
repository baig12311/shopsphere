import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import Colors from '../../constants/colors';
import fonts, { fontSize } from '../../constants/typography';
import Input from './Input';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import CustomEmptyComponent from './CustomEmptyComponent';
import Button from './Button';
import Icon from './Icon';
interface Props {
    bottomSheetRef: React.RefObject<BottomSheet | null>;
    //options: any[]
    options: Record<string, any>[];
    searchable: boolean
    displayKeys: string[]
    searchPlaceholder: string
    title: string
    currency?: string
    emptyMessage?: string
    emptyTitle?: string
    onSelect: (value: any) => void;
}

const CustomBottomSheet: React.FC<Props> = ({ emptyMessage, emptyTitle, currency, displayKeys, searchPlaceholder, bottomSheetRef, options, title, onSelect, searchable }) => {
    const insets = useSafeAreaInsets()
    const [searchText, setSearchText] = useState('')
    // filter item
    const filteredOptions = options.filter((option) => {
        const text =
            typeof option === 'string'
                ? option
                : String(option.name ?? '');

        return text
            .toLowerCase()
            .includes(searchText.trim().toLowerCase());
    });

    const isSearchEmpty =
        searchText.trim().length > 0 && filteredOptions.length === 0;

    const isOptionsEmpty = options.length === 0;

    // render options
    const renderOptions = ({ item: option, index }: { item: any, index: number }) => {
        return (
            <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => onSelect(option)}
                style={[styles.optionButton,

                index === 0 && { borderTopWidth: 1 },]}
            >
                {
                    typeof option === 'string' ? (
                        <Text style={styles.options}>{option}</Text>

                    ) : (
                        //     displayKeys?.map((key)=>(
                        //     <Text key={key}>{option[key]}</Text>
                        // ))
                        <View style={styles.optionContent}>

                            {/* Left side */}
                            <View style={styles.optionLeft}>

                                {displayKeys.includes('image_url') && (
                                    option.image_url ? (
                                        <Image
                                            source={{ uri: option.image_url }}
                                            style={styles.optionImage}
                                            resizeMode='contain'
                                        />
                                    ) : (
                                        <View style={styles.placeholder}>
                                            <Icon
                                                name='cube-outline'
                                                type='Ionicons'
                                                size={wp(5)}
                                                color={Colors.primary}
                                            />
                                        </View>
                                    )

                                )}
                                {displayKeys.includes('flag') && (
                                    <Text style={styles.options} numberOfLines={1}>
                                        {option.flag}
                                    </Text>
                                )}

                                {displayKeys.includes('name') && (
                                    <Text
                                        style={[styles.options, { flex: 1, minWidth: 0 }]}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {option.name}
                                    </Text>
                                )}


                            </View>

                            {/* Right side */}

                            <View style={styles.optionRight}>
                                {displayKeys.includes('price') && (
                                    <Text
                                        style={[styles.options, { flexShrink: 1, textAlign: 'right' }]}
                                        ellipsizeMode="tail"
                                        numberOfLines={1}
                                    >
                                        {`${currency} ${option.price.toLocaleString()}`}
                                    </Text>
                                )}
                                {displayKeys.includes('code') && (
                                    <Text style={styles.options} numberOfLines={1}>
                                        {option.code}
                                    </Text>
                                )}

                                {displayKeys.includes('phone') && (
                                    <Text style={styles.options} numberOfLines={1}>
                                        {option.phone}
                                    </Text>
                                )}

                                {displayKeys.includes('stock_quantity') && (
                                    <Text style={styles.options} numberOfLines={1}>
                                        {`Stock: ${option.stock_quantity}`}
                                    </Text>
                                )}

                                {displayKeys.includes('dialCode') && (
                                    <Text style={styles.options} numberOfLines={1}>
                                        {option.dialCode}
                                    </Text>
                                )}
                            </View>


                        </View>
                    )
                }

            </TouchableOpacity>

        )
    }
    return (
        <BottomSheet
            ref={bottomSheetRef}
            //index={-1}
            snapPoints={['60%', '90%']}
            enablePanDownToClose
            enableDynamicSizing={false}
            backdropComponent={(props) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.6}
                    pressBehavior="close"
                />
            )}
            backgroundStyle={{
                backgroundColor: Colors.background,
            }}
        >


            <View style={[styles.sheet, { paddingBottom: insets.bottom + hp(6) }]}>
                <Text style={styles.title}>{title}</Text>
                {
                    searchable && (
                        <Input
                            placeholder={`Search ${searchPlaceholder}...`}
                            value={searchText}
                            onChangeText={setSearchText}
                            iconName='search-outline'
                            iconType='Ionicons'
                        />
                    )
                }
                <BottomSheetFlatList
                    data={filteredOptions}
                    renderItem={renderOptions}
                    showsVerticalScrollIndicator={false}
                    style={{
                        borderWidth: 1, borderColor: Colors.background
                    }}
                    contentContainerStyle={{ paddingBottom: hp(6), marginBottom: hp(4) }}
                    ListEmptyComponent={
                        isSearchEmpty ? (
                            <CustomEmptyComponent
                                mainText={`No Matching ${searchPlaceholder.charAt(0).toUpperCase() + searchPlaceholder.slice(1)}`}
                                subText={`We couldn't find any ${searchPlaceholder} matching your search. Try a different keyword.`}
                            />
                        ) : isOptionsEmpty ? (
                            <CustomEmptyComponent
                                mainText={emptyTitle}
                                subText={emptyMessage}
                            />
                        ) : null
                    }

                />
            </View>

        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    sheet: {
        padding: hp(2),
        //borderWidth: 4,
        marginBottom: hp(5),
        width: '100%',
    },
    optionButton: {
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'space-between',
        width: '100%',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flex: 1,
        minWidth: 0,
    },
    optionRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flex: 1,
        justifyContent: 'flex-end',
        minWidth: 0,
    },
    title: {
        fontFamily: fonts.bold,
        fontSize: fontSize.subHeading,
        color: Colors.text,
        marginBottom: hp(1)
    },
    options: {
        fontFamily: fonts.medium,
        fontSize: fontSize.text,
        color: Colors.text,
        //flex:1,
        //flexShrink:1,
    },
    optionImage: {
        width: wp(8),
        height: wp(8),
        borderRadius: wp(2),
        borderWidth: 0.5,
        borderColor: Colors.border,
    },
    placeholder: {
        borderWidth: 0.3,
        width: wp(8),
        height: wp(8),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp(2),
        borderColor: Colors.surface,
        backgroundColor: Colors.surface,
        //overflow: 'hidden'
    },

});

//make this component available to the app
export default CustomBottomSheet;
