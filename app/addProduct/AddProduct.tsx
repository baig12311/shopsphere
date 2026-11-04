import { useState, useRef, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, ScrollView, Platform, Alert, TouchableOpacity, Image, ActivityIndicator} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { takePhoto, pickFromLibrary } from '../../src/services/imagePicker';
import ImageSheet from '../../src/components/uploadImage/ImageSheet';
import CustomEmptyComponent from '../../src/components/common/CustomEmptyComponent';
import { router } from 'expo-router';
import Colors from '../../src/constants/colors';
import Icon from '../../src/components/common/Icon';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useLocalSearchParams } from 'expo-router';
import Header from '../../src/components/common/Header';
import { useAddProduct } from '../../src/hooks/useAddProduct';
import { useProducts, useProductById } from '../../src/hooks/useProducts';
import { useUpdateProduct } from '../../src/hooks/useUpdateProduct';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { productSchema } from '../../src/services/schema/productSchema';
import styles from './AddProductStyle';
import { uploadImage } from '../../src/services/convertImage';
import BottomSheet from '@gorhom/bottom-sheet';
import { useToast } from '../../src/context/ToastContext';
const AddProduct = () => {
    const { showToast } = useToast()
    const { productId } = useLocalSearchParams<{
        productId: string;
    }>();
    console.log('productId', productId)
    const [image, setImage] = useState<string | null>(null)
    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [showSheet, setShowSheet] = useState(false)
    const [sheetEdit, setSheetEdit] = useState(false)
    const sheetRef = useRef<BottomSheet>(null)
    const { data: user , isLoading: userLoading, error: userError, refetch: userRefetch} = useUser()
    const { data: business, isLoading: businessLoading, error: businessError, refetch: businessRefetch} = useBusiness(user?.id)
    const businessId = business?.id
    const { data: selectedProduct, isLoading: productLoading, error: productError, refetch: productRefetch} = useProductById(productId)
    const [submitting, setSubmitting] = useState(false)
    const {
        mutateAsync: addProductMutation,
        error: addError,
        isPending,
    } = useAddProduct(businessId);
    const {
        mutateAsync: updateProductMutation,
        isPending: pending,
        error: updateError,
    } = useUpdateProduct(businessId);
    const isLoading = isPending || pending || submitting
   const isDataLoading =
    userLoading ||
    businessLoading ||
    (!!productId && productLoading);

const isErrorFetching =
    userError ||
    businessError ||
    (!!productId && productError);

    

    const [product, setProduct] = useState({
        productName: '',
        description: '',
        costPrice: '',
        price: '',
        stockQuantity: '',
        lowStockThreshold: ''
    })
    const [errors, setErrors] = useState<{
        name?: string;
        desc?: string;
        price?: string;
        costPrice?: string
        stock?: string
        lowStock?: string
    }>({})
    const isDisabled = !product.productName || !product.price || !product.costPrice || !product.stockQuantity || !product.lowStockThreshold
    //chekcing existing info
    const setSelectedProduct = () => {
        if (selectedProduct) {
            setProduct({
                productName: selectedProduct.name ?? '',
                description: selectedProduct.description ?? '',
                price: selectedProduct.price.toString() ?? '',
                costPrice: selectedProduct.cost_price.toString() ?? '',
                stockQuantity: selectedProduct.stock_quantity.toString() ?? '',
                lowStockThreshold: selectedProduct.low_stock_threshold.toString() ?? '',

            })
            if (selectedProduct.image_url) {
                setImage(selectedProduct.image_url ?? '')

                setSheetEdit(true)
                setExistingImage(selectedProduct.image_url);
            }





        }
    }
    useEffect(() => {
        setSelectedProduct()
    }, [selectedProduct])

    // image action
    const handleImageAction = async (action: 'camera' | 'gallery' | 'remove') => {
        sheetRef.current?.close()
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
    // validate product
    const validateProduct = () => {
        const result = productSchema.safeParse(product);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;

            setErrors({
                name: fieldErrors.productName?.[0],
                desc: fieldErrors.description?.[0],
                costPrice: fieldErrors.costPrice?.[0],
                price: fieldErrors.price?.[0],
                stock: fieldErrors.stockQuantity?.[0],
                lowStock: fieldErrors.lowStockThreshold?.[0],
            });

            return false;
        }

        setErrors({});

        return true;
    };
    // update product 
    const updateProducts = async () => {
        if (!validateProduct()) {
            return
        }
        let imageUrl = existingImage;

        if (image && image !== existingImage) {
            imageUrl = await uploadImage(
                image,
                'product-images',
                businessId
            );
        }
        await updateProductMutation({
            productId,
            name: product.productName,
            description: product.description,
            price: Number(product.price),
            costPrice: Number(product.costPrice),
            stockQuantity: Number(product.stockQuantity),
            lowStockThreshold: Number(product.lowStockThreshold),
            imageUrl,
        });
        return true
    }
    // add product
    const AddProduct = async () => {
        if(submitting) return;
        setSubmitting(true)
        try {
            if (productId) {

                const ok = await updateProducts()
                if(!ok)
                {
                    return
                }
                showToast(
                    'success',
                    'Product Updated',
                    'Product details have been updated successfully.'
                )
                setProduct({
                    productName: '',
                    description: '',
                    costPrice: '',
                    price: '',
                    stockQuantity: '',
                    lowStockThreshold: ''
                })
                router.back()

            }
            else {

                if (!validateProduct()) {
                    return
                }
                let imageUrl = null;

                if (image) {
                    imageUrl = await uploadImage(image,
                        'product-images',
                        businessId);
                }
                await addProductMutation({
                    businessId,
                    name: product.productName,
                    description: product.description,
                    price: Number(product.price),
                    costPrice: Number(product.costPrice),
                    stockQuantity: Number(product.stockQuantity),
                    lowStockThreshold: Number(product.lowStockThreshold),
                    imageUrl,
                });
                showToast(
                    'success',
                    'Product Added',
                    'Product has been added successfully.'
                )

                setProduct({
                    productName: '',
                    description: '',
                    costPrice: '',
                    price: '',
                    stockQuantity: '',
                    lowStockThreshold: ''
                })
                router.back()


            }

        }
        catch (error) {

            showToast(
                'error',
                productId ? 'Unable to update product details' : 'Unable to add product',
                productId ? "We couldn't update product. Please try again." :
                    "We couldn't add product. Please try again.",

            )

        }
    }
    const handleRetry = ()=>{
        userRefetch(),
        businessRefetch(),
        productRefetch()
    }
    if(isDataLoading)
        

    {
        return (
            <SafeAreaView style={styles.container}>
            <Header title={productId ? 'Edit Product' : 'Add Product'}
                    onPress={() => router.back()}
                />
                <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size='large' color={Colors.primary}/>
                </View>
        </SafeAreaView>
        )
        
    }

     if (isErrorFetching) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title={productId ? 'Edit Product' : 'Add Product'}
                    onPress={() => router.back()}
                />
                    
                <CustomEmptyComponent 
                isError={true}
                mainText='Something Went Wrong'
                subText='Unable to load product data. Please try again.'
                onPress={handleRetry}
                />

            </SafeAreaView>
        )
    }
    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <Header title={productId ? 'Edit Product' : 'Add Product'}
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
                        {
                            !productId && (<Text style={styles.subHeading}>Add product details to keep your inventory organized..</Text>
                            )
                        }
                        {/* <Text style={styles.heading}>Add new product</Text> */}
                        <View style={styles.imageContainer}>
                            {
                                image ? (
                                    <Image
                                        source={{ uri: image }}
                                        style={styles.image}
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={styles.selectImage}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            setShowSheet(true),
                                                sheetRef.current?.snapToIndex(0)
                                        }}
                                    >

                                        <Icon
                                            name='upload-file'
                                            type='MaterialIcons'
                                            size={wp(10)}
                                            color={Colors.primaryDark}
                                        />



                                    </TouchableOpacity>
                                )
                            }
                            {
                                (!image) && (
                                    <Text style={styles.text}>Upload product image</Text>

                                )
                            }
                            {
                                (image) && (
                                    <TouchableOpacity
                                        style={styles.row}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            setShowSheet(true),
                                                sheetRef.current?.snapToIndex(0)
                                        }}
                                    >
                                        <Icon
                                            name='edit'
                                            type='Feather'
                                            size={wp(5)}
                                            color={Colors.primary}
                                        />

                                        <Text style={[styles.rowText, { color: Colors.primary }]}>Change product image</Text>

                                    </TouchableOpacity>
                                )
                            }

                        </View>
                        <Input
                            title='Product Name*'
                            placeholder='Product'
                            value={product.productName}

                            onChangeText={(text: string) => {
                                setProduct({
                                    ...product,
                                    productName: text,
                                });

                                setErrors({
                                    ...errors,
                                    name: undefined,
                                });
                            }}
                            error={errors.name}

                        // iconName='person-outline'
                        // iconType='Ionicons'
                        />
                        {/* <Input
                            title='Description (optional)'
                            placeholder='This product is ......'
                            value={product.description}
                            onChangeText={(text: string) => {
                                setProduct({
                                    ...product,
                                    description: text
                                })
                                setErrors({
                                    ...errors,
                                    desc: undefined
                                })
                            }}
                            error={errors.desc}

                        /> */}
                        <Input
                            title='Selling Price*'
                            placeholder='123'
                            keyboard='numeric'
                            value={product.price}
                            onChangeText={(text: string) => {
                                setProduct({
                                    ...product,
                                    price: text
                                })
                                setErrors({
                                    ...errors,
                                    price: undefined
                                })
                            }}
                            error={errors.price}
                        // iconName='lock'
                        // iconType='SimpleLineIcons'

                        />
                        <Input
                            title='Cost Price*'
                            placeholder='123'
                            keyboard='numeric'
                            value={product.costPrice}
                            onChangeText={(text: string) => {
                                setProduct({
                                    ...product,
                                    costPrice: text
                                })
                                setErrors({
                                    ...errors,
                                    costPrice: undefined
                                })
                            }}
                            error={errors.costPrice}
                        // iconName='lock'
                        // iconType='SimpleLineIcons'
                        />
                        <Input
                            title='Stock Quantity*'
                            placeholder='0'
                            keyboard='numeric'
                            value={product.stockQuantity}
                            onChangeText={(text: string) => {
                                setProduct({
                                    ...product,
                                    stockQuantity: text
                                })
                                setErrors({
                                    ...errors,
                                    stock: undefined
                                })
                            }}
                            error={errors.stock}
                        />
                        <Input
                            title='Low Stock Threshold*'
                            placeholder='0'
                            keyboard='numeric'
                            value={product.lowStockThreshold}
                            onChangeText={(text: string) => {
                                setProduct({
                                    ...product,
                                    lowStockThreshold: text
                                })
                                setErrors({
                                    ...errors,
                                    lowStock: undefined
                                })
                            }}
                            error={errors.lowStock}

                        />
                        <View style={styles.button}>
                            <Button
                                title={productId ? 'Edit Product' : 'Add Product'}
                                onPress={AddProduct}
                                isLoading={isLoading}
                                disabled={isDisabled}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

            </SafeAreaView>
            {
                showSheet && (
                    <ImageSheet
                        bottomSheetRef={sheetRef}
                        isEdit={image ? true : false}
                        onAction={handleImageAction}

                    />
                )
            }
        </View>

    );

};

export default AddProduct;




