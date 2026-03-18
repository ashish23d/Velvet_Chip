
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { Order, SiteSettings, ContactDetails, DeliverySettings } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';
import { BUCKETS } from '../constants.ts';

const formatCurrency = (amount: number) => `INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface GenerateInvoiceResult {
    pdfBlob: Blob;
    qrBlob: Blob;
    invoiceData: any;
}

// Helper to convert dataURL to Blob without using fetch
function dataURLtoBlob(dataurl: string) {
    try {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        console.error("Error converting data URL to blob:", e);
        return new Blob([], { type: 'image/png' });
    }
}

// Helper to generate Barcode Data URL using an off-screen canvas
function generateBarcodeDataUrl(text: string): string {
    try {
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, text, {
            format: "CODE128",
            displayValue: false, // Hide text below barcode (we draw it manually in PDF)
            lineColor: "#000",
            width: 2,
            height: 40,
            margin: 0
        });
        return canvas.toDataURL("image/png");
    } catch (e) {
        console.error("Error generating barcode:", e);
        return "";
    }
}

export const generateInvoicePDF = async (
    order: Order,
    siteSettings: SiteSettings | null,
    contactDetails: ContactDetails,
    deliverySettings: DeliverySettings | null
): Promise<GenerateInvoiceResult> => {
    const doc = new jsPDF();

    const invoiceNumber = order.invoice_number || `INV-${new Date().getFullYear()}-${order.id.slice(-6).toUpperCase()}`;
    const packetId = `PKT-${Date.now()}`;

    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = items.reduce((acc, item: any) => {
        const price = item.product?.price || item.price || 0;
        return acc + (price * item.quantity);
    }, 0);
    const isPickup = order.delivery_type === 'pickup';
    const baseCharge = deliverySettings?.base_charge ?? 50;
    const freeThreshold = deliverySettings?.free_delivery_threshold ?? 499;
    const shippingCharge = (isPickup || subtotal >= freeThreshold) ? 0 : baseCharge;

    const taxRate = 0.18;
    const taxableValue = subtotal / (1 + taxRate);
    const totalTax = subtotal - taxableValue;

    // Load Logo
    try {
        if (siteSettings?.activeLogoPath) {
            const { data, error } = await supabase.storage.from(BUCKETS.SITE_ASSETS).download(siteSettings.activeLogoPath);
            if (data && !error) {
                const imgBuffer = await data.arrayBuffer();
                const imgUint8 = new Uint8Array(imgBuffer);
                let binary = '';
                for (let i = 0; i < imgUint8.length; i++) binary += String.fromCharCode(imgUint8[i]);
                const logoBase64 = btoa(binary);
                const ext = siteSettings.activeLogoPath.split('.').pop()?.toLowerCase();
                const format = ext === 'png' ? 'PNG' : 'JPEG';
                doc.addImage(logoBase64, format, 15, 15, 50, 15, undefined, 'FAST');
            } else if (error) {
                console.warn("Storage download error for logo:", error);
            }
        }
    } catch (e) {
        console.warn("Warning: Could not load logo for invoice via storage download.", e);
    }

    // Invoice Title
    doc.setFontSize(22);
    doc.setTextColor(siteSettings?.primaryColor || '#C22255');
    doc.text("TAX INVOICE", 195, 20, { align: "right" });

    // Barcode (Order ID)
    const barcodeData = generateBarcodeDataUrl(order.id);
    if (barcodeData) {
        doc.addImage(barcodeData, 'PNG', 150, 25, 45, 10); // Width 45, Height 10
    }

    // Details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #: ${invoiceNumber}`, 195, 42, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 195, 47, { align: "right" });
    doc.text(`Order ID: ${order.id}`, 195, 52, { align: "right" });

    // --- Sold By & Bill To ---
    const startY = 65;

    // Sold By
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Sold By:", 15, startY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Awaany Fashions", 15, startY + 5);

    const sellerAddrLines = doc.splitTextToSize(contactDetails?.address || 'N/A', 80);
    doc.text(sellerAddrLines, 15, startY + 10);
    let currentY = startY + 10 + (sellerAddrLines.length * 4);
    doc.text(`GSTIN: 27AABCU9603R1ZM`, 15, currentY + 5);
    doc.text(`Email: ${contactDetails?.email || 'N/A'}`, 15, currentY + 10);

    // Bill To
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Bill To:", 110, startY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Safely extract shipping details
    const shipping = order.shippingAddress || {} as any;
    const customerName = order.customerName || shipping.name || 'Customer';
    doc.text(customerName, 110, startY + 5);

    const addressParts = [shipping.address, shipping.locality, shipping.city, shipping.state].filter(Boolean);
    const buyerAddr = addressParts.length > 0
        ? `${addressParts.join(', ')} - ${shipping.pincode || ''}`
        : 'Address not provided';

    const buyerAddrLines = doc.splitTextToSize(buyerAddr, 80);
    doc.text(buyerAddrLines, 110, startY + 10);
    const buyerY = startY + 10 + (buyerAddrLines.length * 4);
    doc.text(`Phone: ${shipping.mobile || 'N/A'}`, 110, buyerY + 5);

    // --- Items Table ---
    const tableStartY = Math.max(currentY + 15, buyerY + 15);

    const tableData = items.map((item: any, index: number) => {
        const name = item.product?.name || item.name || 'Unknown Product';
        const hsn = item.product?.hsnCode || 'N/A';
        const price = Number(item.product?.price || item.price || 0);
        const qty = Number(item.quantity || 1);
        const colorName = item.selectedColor?.name || item.selectedColor || '';
        const size = item.selectedSize || '';

        return [
            index + 1,
            `${name}\nSize: ${size} | Color: ${colorName}`,
            hsn,
            qty,
            formatCurrency(price / 1.18).replace('INR ', ''),
            formatCurrency(price * qty).replace('INR ', '')
        ];
    });

    autoTable(doc, {
        startY: tableStartY,
        head: [['#', 'Item Description', 'HSN', 'Qty', 'Taxable Rate', 'Total']],
        body: tableData.length > 0 ? tableData : [['', 'No items found', '', '', '', '']],
        theme: 'grid',
        headStyles: { fillColor: siteSettings?.primaryColor || '#C22255' },
        styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 20 },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 25, halign: 'right' },
            5: { cellWidth: 30, halign: 'right' }
        }
    });

    // --- Totals ---
    // Safely get the final Y position after the table
    const lastAutoTable = (doc as any).lastAutoTable;
    let finalY = lastAutoTable && lastAutoTable.finalY ? lastAutoTable.finalY + 10 : tableStartY + 30;

    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    }

    const totalsX = 130;
    const valuesX = 195;

    doc.text("Subtotal:", totalsX, finalY);
    doc.text(formatCurrency(taxableValue), valuesX, finalY, { align: "right" });

    finalY += 6;
    doc.text("IGST (18%):", totalsX, finalY);
    doc.text(formatCurrency(totalTax), valuesX, finalY, { align: "right" });

    finalY += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Grand Total:", totalsX, finalY);
    doc.text(formatCurrency(Number(order.totalAmount || 0)), valuesX, finalY, { align: "right" });

    // --- QR Code ---
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(`https://awaany.com/#/invoice/${order.id}`, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            margin: 1,
            width: 100
        });
        const qrBase64 = qrCodeDataUrl.split(',')[1];

        if (finalY > 240) {
            doc.addPage();
            finalY = 20;
        }

        doc.addImage(qrBase64, 'PNG', 15, finalY, 25, 25);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Scan to verify", 27.5, finalY + 28, { align: 'center' });
    } catch (e) {
        console.warn("Failed to generate QR code:", e);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.", 15, pageHeight - 20);
    doc.text("This is a computer generated invoice and does not require a signature.", 15, pageHeight - 15);

    // Generate Blobs
    const pdfBlob = doc.output('blob');
    const qrBlob = await (async () => {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(`https://awaany.com/#/invoice/${order.id}`);
            return dataURLtoBlob(qrCodeDataUrl);
        } catch {
            return new Blob();
        }
    })();

    return {
        pdfBlob,
        qrBlob,
        invoiceData: {
            invoice_number: invoiceNumber,
            invoice_date: new Date().toISOString(),
            gst_details: {
                nature_of_transaction: "Sale",
                taxable_amount: parseFloat(taxableValue.toFixed(2)),
                cgst: parseFloat((totalTax / 2).toFixed(2)),
                sgst: parseFloat((totalTax / 2).toFixed(2)),
                igst: 0,
                total_tax: parseFloat(totalTax.toFixed(2)),
            },
            vendor_info: {
                name: "Awaany Fashions",
                gstin: "27AABCU9603R1ZM",
                address: contactDetails.address,
                email: contactDetails.email,
            },
            total_amount: order.totalAmount,
            packet_id: packetId,
        }
    };
};
