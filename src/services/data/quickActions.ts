import { router } from "expo-router"
export const quickActions=[
    {
        title:'Track Inventory',
        name:'file-tray-full-outline',
        type:'Ionicons',
        onPress:()=>router.push('/inventory/Inventory')
    },
    {
        title:'Expenses',
        name:'wallet-outline',
        type:'Ionicons',
        onPress: ()=>router.push('/expense/Expense')
    },
    {
        title:'Add Product',
        name:'cube-outline',
        type:'Ionicons',
        onPress: ()=>router.push('/addProduct/AddProduct')
    },
    {
        title:'Add Customer',
        name:'person-add-outline',
        type:'Ionicons',
        onPress:()=>router.push('/addCustomer/AddCustomer')
    },
    {
        title:'Create New Order',
        name:'receipt-outline',
        type:'Ionicons',
        onPress: ()=>router.push('/newOrder/NewOrder')
    },
]