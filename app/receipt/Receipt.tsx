import { useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { View, Text, ScrollView, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import { File, Paths } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { useUser } from '../../src/hooks/useUser';
import { useBusiness } from '../../src/hooks/useBusiness';
import { useOrderById } from '../../src/hooks/useOrderById';

import { getInitials } from '../../src/services/getInitials';

import fonts, { fontSize } from '../../src/constants/typography';
import ActionButton from '../../src/components/common/ActionButton';
import Colors from '../../src/constants/colors';
import styles from './ReceiptStyle';
import Header from '../../src/components/common/Header';
import InvoiceRow from '../../src/components/invoice/InvoiceRow';


const Receipt = () => {
    const receiptRef = useRef<View | null>(null);

    const { orderId } = useLocalSearchParams<{
        orderId: string;
    }>();

    const { data } = useUser();
    const { data: business } = useBusiness(data?.id);
    const { data: order } = useOrderById(orderId);

    const businessLogo = business?.logo_url;
    const busineesInitials = getInitials(business?.name);

    // Order items
    const orderItems = order?.order_items ?? [];

    // Subtotal
    const subTotal = orderItems.reduce((total: any, item: any) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;

        return total + quantity * unitPrice;
    }, 0);

    // Order values
    const totalAmount = Number(order?.total_amount) || 0;
    const amountPaid = Number(order?.paid_amount) || 0;

    // Return amount
    const returnAmount = Math.max(amountPaid - totalAmount, 0);

    // Discount
    const discount = Math.max(subTotal - totalAmount, 0);

    // Format date
    const formattedDate = order?.created_at
        ? new Date(order.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        : '';

    // Format time
    const formattedTime = order?.created_at
        ? new Date(order.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
        : '';

    // Handle Share
    const handleShare = async () => {
        try {
            if (!receiptRef.current) return;

            const uri = await captureRef(receiptRef, {
                format: 'png',
                quality: 1,
                result: 'tmpfile',
            });

            if (!(await Sharing.isAvailableAsync())) {
                return;
            }

            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: 'Share Receipt',
            });

        } catch (error) {
            console.log('Share receipt error:', error);
        }
    };



    // handle print


        const escapeHtml = (value: unknown) =>
        String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const buildReceiptHtml = () => {
        if (!order || !business) return null;

        const currency = escapeHtml(business.currency || '');
        const businessName = escapeHtml(business.name || 'Business');
        const invoiceNumber = escapeHtml(order.order_number ?? '');
        const customerName = escapeHtml(
            order.customer?.name ?? 'Walk-in Customer'
        );
        const customerPhone = escapeHtml(order.customer?.phone ?? '');
        const dateTime = escapeHtml(
            `${formattedDate} ${formattedTime}`.trim()
        );

        const logoHtml = businessLogo
            ? `<img class="logo" src="${escapeHtml(businessLogo)}" />`
            : `<div class="logo-placeholder">${escapeHtml(
                busineesInitials || 'B'
            )}</div>`;

        const itemRows = orderItems.map((item: any) => {
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.unit_price) || 0;
            const lineTotal = quantity * unitPrice;
            const productName = escapeHtml(item.product?.name || 'Product');

            return `
                <tr>
                    <td class="product">${productName}</td>
                    <td class="qty">${quantity}</td>
                    <td class="price">${unitPrice.toLocaleString()}</td>
                    <td class="total">${lineTotal.toLocaleString()}</td>
                </tr>
            `;
        }).join('');

        const summaryRow = (
            title: string,
            amount: number,
            strong = false
        ) => `
            <div class="summary-row ${strong ? 'strong' : ''}">
                <span>${escapeHtml(title)}</span>
                <span>${currency} ${amount.toLocaleString()}</span>
            </div>
        `;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <meta name="viewport"
                    content="width=device-width, initial-scale=1" />

                <style>
                    @page {
                        margin: 0;
                    }

                    * {
                        box-sizing: border-box;
                    }

                    html, body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 11px;
                        color: #222;
                        overflow-wrap: anywhere;
                    }

                    .page {
                        width: 100%;
                        display: flex;
                        justify-content: center;
                    }

                    .receipt {
                        width: 100%;
                        max-width: 72mm;
                        padding: 8px;
                    }

                    .header {
                        text-align: center;
                        padding-bottom: 10px;
                        border-bottom: 1px dashed #777;
                    }

                    .logo {
                        display: block;
                        width: 56px;
                        height: 56px;
                        object-fit: contain;
                        margin: 0 auto 8px;
                    }

                    .logo-placeholder {
                        width: 48px;
                        height: 48px;
                        border-radius: 24px;
                        margin: 0 auto 8px;
                        background: #e8f3ed;
                        color: #0e4d3a;
                        font-size: 18px;
                        font-weight: bold;
                        line-height: 48px;
                        text-align: center;
                    }

                    .business-name {
                        font-size: 17px;
                        font-weight: bold;
                        margin-bottom: 6px;
                    }

                    .invoice-number {
                        font-weight: bold;
                        margin-top: 8px;
                    }

                    .muted {
                        color: #555;
                        margin-top: 5px;
                    }

                    .customer-details {
                        padding: 9px 0;
                        line-height: 1.6;
                        border-bottom: 1px dashed #777;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                        margin-top: 10px;
                    }

                    th, td {
                        padding: 6px 2px;
                        text-align: right;
                        vertical-align: top;
                        border-bottom: 1px solid #e5e5e5;
                        overflow-wrap: anywhere;
                    }

                    th {
                        font-size: 9px;
                        border-bottom: 1px solid #777;
                    }

                    th:first-child, td.product {
                        text-align: left;
                        width: 40%;
                    }

                    th:nth-child(2), td.qty {
                        width: 12%;
                    }

                    th:nth-child(3), td.price {
                        width: 22%;
                    }

                    th:nth-child(4), td.total {
                        width: 26%;
                    }

                    .summary {
                        padding-top: 8px;
                    }

                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        gap: 8px;
                        padding: 5px 0;
                    }

                    .summary-row span:last-child {
                        text-align: right;
                    }

                    .strong {
                        font-weight: bold;
                        font-size: 12px;
                        border-top: 1px solid #777;
                        padding-top: 8px;
                    }

                    .footer {
                        text-align: center;
                        border-top: 1px dashed #777;
                        margin-top: 10px;
                        padding-top: 12px;
                        line-height: 1.6;
                        font-weight: bold;
                    }
                </style>
            </head>

            <body>
                <div class="page">
                    <main class="receipt">
                        <header class="header">
                            ${logoHtml}
                            <div class="business-name">${businessName}</div>
                            <div class="invoice-number">
                                Invoice #${invoiceNumber}
                            </div>
                            <div class="muted">${dateTime}</div>
                        </header>

                        <section class="customer-details">
                            <div>Customer: ${customerName}</div>
                            ${customerPhone
                                ? `<div>Phone: ${customerPhone}</div>`
                                : ''}
                        </section>

                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemRows}
                            </tbody>
                        </table>

                        <section class="summary">
                            ${summaryRow('Subtotal', subTotal)}
                            ${summaryRow('Discount', discount)}
                            ${summaryRow('Total', totalAmount, true)}
                            ${summaryRow('Amount Paid', amountPaid)}
                            ${returnAmount > 0
                                ? summaryRow('Change', returnAmount)
                                : ''}
                        </section>

                        <footer class="footer">
                            <div>Thank You!</div>
                            <div>Visit Again</div>
                        </footer>
                    </main>
                </div>
            </body>
            </html>
        `;

        return html;
    };

    // Seedha print dialog
    const handlePrint = async () => {
        try {
            const html = buildReceiptHtml();
            if (!html) return;

            await Print.printAsync({ html });
        } catch (error) {
            console.error('Print receipt error:', error);
        }
    };

    // PDF share
    const handleSharePdf = async () => {
        try {
            const html = buildReceiptHtml();
            if (!html) return;

            const pageHeight = Math.max(450, 380 + orderItems.length * 34);

            const { uri } = await Print.printToFileAsync({
                html,
                width: 226,
                height: pageHeight,
            });

            const source = new File(uri);
            const copy = new File(Paths.cache, `receipt-${Date.now()}.pdf`);
            source.copy(copy);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(copy.uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Share Receipt PDF',
                });
            }
        } catch (error) {
            console.error('Share PDF error:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title='Invoice'
                onPress={() => router.back()}
            />

            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: 20
                }}
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={styles.invoiceContainer}
                    ref={receiptRef}
                    collapsable={false}
                >
                    <View style={styles.invoice}>

                        {
                            businessLogo ? (
                                <Image
                                    style={styles.logo}
                                    source={{ uri: businessLogo }}
                                />
                            ) : (
                                <View style={styles.logoAvatar}>
                                    <Text style={styles.initial}>
                                        {busineesInitials}
                                    </Text>
                                </View>
                            )
                        }

                        <Text
                            style={[
                                styles.invoiceNumber,
                                styles.businessName
                            ]}
                        >
                            {business?.name}
                        </Text>

                        <Text style={styles.invoiceNumber}>
                            Invoice# {order?.order_number}
                        </Text>

                        <Text style={styles.time}>
                            {formattedDate} {formattedTime}
                        </Text>

                        <Text style={styles.customer}>
                            Customer: {order?.customer?.name ?? 'Walk-in Customer'}
                        </Text>

                        {
                            order?.customer?.phone && (
                                <Text style={[styles.customer, {marginBottom: hp(1)}]}>
                                    Phone: {order.customer.phone}
                                </Text>
                            )
                        }

                        <View style={styles.invoiceTable}>

                            <InvoiceRow
                                name='Product Name'
                                quantity='Qty'
                                price='Unit Price'
                                subTotal='Total'
                                isHeading={true}
                            />

                            {
                                orderItems.map((item: any) => {
                                    const quantity =
                                        Number(item.quantity) || 0;

                                    const unitPrice =
                                        Number(item.unit_price) || 0;

                                    const subtotal =
                                        quantity * unitPrice;

                                    return (
                                        <InvoiceRow
                                            key={item.id}
                                            name={item.product?.name}
                                            quantity={quantity}
                                            price={unitPrice.toLocaleString()}
                                            subTotal={subtotal.toLocaleString()}
                                        />
                                    );
                                })
                            }

                        </View>

                        <View style={styles.totalContainer}>

                            <Row
                                title='Subtotal'
                                text={subTotal.toLocaleString()}
                                color={Colors.textSecondary}
                                fontSize={fontSize.smallText}
                                font={fonts.medium}
                                currency={business?.currency}
                            />

                            <Row
                                title='Discount'
                                text={discount.toLocaleString()}
                                color={Colors.textSecondary}
                                fontSize={fontSize.smallText}
                                font={fonts.medium}
                                currency={business?.currency}
                            />

                            <Row
                                title='Total'
                                text={totalAmount.toLocaleString()}
                                color={Colors.text}
                                fontSize={fontSize.text}
                                font={fonts.bold}
                                currency={business?.currency}
                            />

                            <Row
                                title='Amount Paid'
                                text={amountPaid.toLocaleString()}
                                color={Colors.textSecondary}
                                fontSize={fontSize.smallText}
                                font={fonts.medium}
                                currency={business?.currency}
                            />
                            {
                                returnAmount > 0 && <Row
                                    title='Change'
                                    text={returnAmount.toLocaleString()}
                                    color={Colors.textSecondary}
                                    fontSize={fontSize.smallText}
                                    font={fonts.medium}
                                    currency={business?.currency}
                                />
                            }


                        </View>

                        <Text style={styles.txtThank}>
                            Thank You!
                        </Text>

                        <Text style={styles.visit}>
                            Visit Again
                        </Text>

                    </View>
                </View>
            </ScrollView>

            <View style={styles.actionRow}>

                <ActionButton
                    title='Print'
                    iconName='print-outline'
                    iconType='Ionicons'
                    onPress={handlePrint}
                />
                <ActionButton
                    title='Share as PDF'
                    iconName='file-pdf'
                    iconType='AntDesign'
                    onPress={handleSharePdf}
                    isSolid={true}
                />
                <ActionButton
                    title='Share'
                    iconName='share-social-outline'
                    iconType='Ionicons'
                    onPress={handleShare}
                />

                

            </View>

        </SafeAreaView>
    );
};


const Row = ({
    text,
    title,
    color,
    fontSize,
    font,
    currency
}: {
    text: string | number;
    title: string;
    color: string;
    fontSize: number;
    font: string;
    currency: string
}) => {
    return (
        <View style={styles.row}>
            <Text
                style={[
                    styles.textPrice,
                    {
                        color: color,
                        fontSize: fontSize,
                        fontFamily: font
                    }
                ]}
            >
                {title}
            </Text>

            <Text
                style={[
                    styles.textPrice,
                    {
                        color: color,
                        fontSize: fontSize,
                        fontFamily: font
                    }
                ]}
            >
                {currency} {text}
            </Text>
        </View>
    );
};

export default Receipt;
