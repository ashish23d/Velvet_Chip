
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { Order, SiteSettings, ContactDetails } from '../types.ts';
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
    contactDetails: ContactDetails
): Promise<GenerateInvoiceResult> => {
    const doc = new jsPDF();

    const invoiceNumber = order.invoice_number || `INV-${new Date().getFullYear()}-${order.id.slice(-6).toUpperCase()}`;
    const packetId = `PKT-${Date.now()}`;
    
    const subtotal = order.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const taxRate = 0.18;
    const taxableValue = subtotal / (1 + taxRate);
    const totalTax = subtotal - taxableValue;

    // --- Header ---
    // Load Logo
    try {
        if (siteSettings?.activeLogoPath) {
            const { data: logoData } = supabase.storage.from(BUCKETS.SITE_ASSETS).getPublicUrl(siteSettings.activeLogoPath);
            // Using a simple fetch to get the blob, assuming CORS allows it or it is same-origin enough for Supabase
            const imgResp = await fetch(logoData.publicUrl).catch(() => null);
            if (imgResp && imgResp.ok) {
                const imgBuffer = await imgResp.arrayBuffer();
                const imgUint8 = new Uint8Array(imgBuffer);
                let binary = '';
                for (let i = 0; i < imgUint8.length; i++) binary += String.fromCharCode(imgUint8[i]);
                const logoBase64 = btoa(binary);
                const ext = siteSettings.activeLogoPath.split('.').pop()?.toLowerCase();
                const format = ext === 'png' ? 'PNG' : 'JPEG';
                doc.addImage(logoBase64, format, 15, 15, 50, 15, undefined, 'FAST'); 
            }
        }
    } catch (e) {
        console.warn("Warning: Could not load logo for invoice.", e);
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
    
    const sellerAddrLines = doc.splitTextToSize(contactDetails.address, 80);
    doc.text(sellerAddrLines, 15, startY + 10);
    let currentY = startY + 10 + (sellerAddrLines.length * 4);
    doc.text(`GSTIN: 27AABCU9603R1ZM`, 15, currentY + 5);
    doc.text(`Email: ${contactDetails.email}`, 15, currentY + 10);

    // Bill To
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Bill To:", 110, startY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const customerName = order.customerName || order.shippingAddress.name || 'Customer';
    doc.text(customerName, 110, startY + 5);
    
    const buyerAddr = `${order.shippingAddress.address}, ${order.shippingAddress.locality}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`;
    const buyerAddrLines = doc.splitTextToSize(buyerAddr, 80);
    doc.text(buyerAddrLines, 110, startY + 10);
    const buyerY = startY + 10 + (buyerAddrLines.length * 4);
    doc.text(`Phone: ${order.shippingAddress.mobile}`, 110, buyerY + 5);

    // --- Items Table ---
    const tableStartY = Math.max(currentY + 15, buyerY + 15);
    
    const tableData = order.items.map((item, index) => [
        index + 1,
        `${item.product.name}\nSize: ${item.selectedSize} | Color: ${item.selectedColor.name}`,
        item.product.hsnCode || 'N/A',
        item.quantity,
        formatCurrency(item.product.price / 1.18).replace('INR ', ''),
        formatCurrency(item.product.price * item.quantity).replace('INR ', '')
    ]);

    autoTable(doc, {
        startY: tableStartY,
        head: [['#', 'Item Description', 'HSN', 'Qty', 'Taxable Rate', 'Total']],
        body: tableData,
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
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 10;
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
    doc.text(formatCurrency(order.totalAmount), valuesX, finalY, { align: "right" });

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
