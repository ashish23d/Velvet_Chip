
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { Order, ContactDetails } from '../types.ts';

// Helper to generate Barcode Data URL
function generateBarcodeDataUrl(text: string): string {
    try {
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, text, {
            format: "CODE128",
            displayValue: true,
            lineColor: "#000",
            width: 2,
            height: 40,
            margin: 0,
            fontSize: 12
        });
        return canvas.toDataURL("image/png");
    } catch (e) {
        console.error("Error generating barcode:", e);
        return "";
    }
}

// Helper to generate QR Data URL
async function generateQRDataUrl(text: string): Promise<string> {
    try {
        return await QRCode.toDataURL(text, { margin: 0, width: 100 });
    } catch (e) {
        console.error("Error generating QR:", e);
        return "";
    }
}

export const generateShippingLabelPDF = async (order: Order, contactDetails: ContactDetails): Promise<Blob> => {
    // 4x6 inches in mm (approx 101.6 x 152.4)
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [101.6, 152.4]
    });

    const width = 101.6;
    const margin = 5;
    const printableWidth = width - (margin * 2);

    doc.setLineWidth(0.5);
    
    // --- Header ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("STANDARD", margin, 12);
    
    doc.setFontSize(12);
    const paymentMethod = order.payment.method === 'COD' ? 'COD' : 'PREPAID';
    doc.text(paymentMethod, width - margin, 12, { align: 'right' });
    
    // Divider
    doc.line(margin, 15, width - margin, 15);

    // --- Ship To ---
    let currentY = 22;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text("SHIP TO:", margin, currentY);
    
    currentY += 5;
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(order.shippingAddress.name.toUpperCase(), margin, currentY);
    
    currentY += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const addressText = `${order.shippingAddress.address}, ${order.shippingAddress.locality}\n${order.shippingAddress.city}, ${order.shippingAddress.state}`;
    const splitAddress = doc.splitTextToSize(addressText, printableWidth);
    doc.text(splitAddress, margin, currentY);
    
    currentY += (splitAddress.length * 4) + 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(order.shippingAddress.pincode, margin, currentY);
    
    currentY += 5;
    doc.setFontSize(9);
    doc.text(`Tel: ${order.shippingAddress.mobile}`, margin, currentY);

    // Divider
    currentY += 4;
    doc.line(margin, currentY, width - margin, currentY);

    // --- Barcode ---
    currentY += 5;
    const barcodeUrl = generateBarcodeDataUrl(order.id);
    if (barcodeUrl) {
        doc.addImage(barcodeUrl, 'PNG', margin + 10, currentY, printableWidth - 20, 20);
    }
    
    currentY += 22;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Tracking ID: ${order.id}`, width / 2, currentY, { align: 'center' });

    // Divider
    currentY += 3;
    doc.line(margin, currentY, width - margin, currentY);

    // --- Return Address & QR ---
    currentY += 5;
    const returnY = currentY;
    
    // Return Address (Left)
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text("RETURN TO (SENDER):", margin, currentY);
    
    currentY += 4;
    doc.setTextColor(0);
    doc.setFontSize(8);
    doc.text("Awaany Fashions", margin, currentY);
    
    currentY += 4;
    doc.setFont("helvetica", "normal");
    const returnAddr = doc.splitTextToSize(contactDetails.address, 55);
    doc.text(returnAddr, margin, currentY);
    
    // QR Code (Right)
    const trackingUrl = `https://awaany.com/#/track-order/${order.id}`;
    const qrUrl = await generateQRDataUrl(trackingUrl);
    if (qrUrl) {
        doc.addImage(qrUrl, 'PNG', width - margin - 25, returnY, 25, 25);
    }

    // Footer Line
    doc.setLineDashPattern([2, 2], 0);
    doc.line(0, 150, width, 150);
    doc.setFontSize(6);
    doc.text("Cut Here", width / 2, 151.5, { align: 'center' });

    return doc.output('blob');
};
