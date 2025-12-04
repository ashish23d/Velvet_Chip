
// FIX: Add Deno namespace to fix "Cannot find name 'Deno'" and type resolution errors in non-Deno environments.
declare const Deno: any;

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import autoTable from "https://esm.sh/jspdf-autotable@3.5.31";
import QRCode from "https://esm.sh/qrcode@1.5.3";
import { corsHeaders } from './cors.ts';
import type { Order, OrderStatus, StatusUpdate, Address, CartItem, SiteSettings, ContactDetails, UserProfile } from './types.ts';

// Helper to format currency
const formatCurrency = (amount: number) => `INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DEFAULT_SETTINGS: SiteSettings = {
    primaryColor: '#C22255',
    activeLogoPath: null,
    previousLogoPaths: [],
};

const DEFAULT_CONTACT_DETAILS: ContactDetails = {
  email: 'support@awaany.com',
  phone: '+91 12345 67890',
  address: '123 Fashion Avenue, Commerce Center, Mumbai, Maharashtra 400053',
};

serve(async (req) => {
  console.log(`[generate-invoice] Function invoked with method: ${req.method}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    const projectUrl = Deno.env.get('PROJECT_URL');
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!projectUrl || !serviceRoleKey) {
        throw new Error("Supabase credentials are not configured correctly in function secrets.");
    }

    const supabaseAdmin = createClient(projectUrl, serviceRoleKey);

    // 1. Fetch Order Data
    const { data: orderResult, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, profile:profiles(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !orderResult) throw new Error(`Order ${orderId} not found.`);
    
    const profile = orderResult.profile as unknown as UserProfile | null;

    const appOrder: Order = {
      id: orderResult.id,
      userId: orderResult.user_id,
      orderDate: orderResult.order_date,
      currentStatus: orderResult.current_status as OrderStatus,
      statusHistory: (orderResult.status_history as unknown as StatusUpdate[] | null) || [],
      totalAmount: orderResult.total_amount,
      shippingAddress: orderResult.shipping_address as unknown as Address,
      items: (orderResult.items as unknown as CartItem[] | null) || [],
      payment: orderResult.payment as unknown as Order['payment'],
      customerName: profile?.name || (orderResult.shipping_address as any)?.name || 'N/A',
      customerEmail: profile?.email || 'N/A',
      promotionCode: orderResult.promotion_code,
      invoice_number: orderResult.invoice_number,
      downloadable_invoice_url: orderResult.downloadable_invoice_url,
    };
    
    // Fetch settings (allow failure with defaults)
    const { data: siteSettingsData } = await supabaseAdmin.from('site_content').select('data').eq('id', 'site_settings').single();
    const { data: contactDetailsData } = await supabaseAdmin.from('site_content').select('data').eq('id', 'contact_details').single();

    const siteSettings: SiteSettings = { ...DEFAULT_SETTINGS, ...(siteSettingsData?.data as any || {}) };
    const contactDetails: ContactDetails = { ...DEFAULT_CONTACT_DETAILS, ...(contactDetailsData?.data as any || {}) };

    // 2. Prepare Calculations
    // Generate a short invoice number if one doesn't exist
    const invoiceNumber = appOrder.invoice_number || `INV-${new Date().getFullYear()}-${orderId.slice(-6).toUpperCase()}`;
    const packetId = `PKT-${Date.now()}`;
    
    const subtotal = appOrder.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const taxRate = 0.18;
    const taxableValue = subtotal / (1 + taxRate);
    const totalTax = subtotal - taxableValue;
    
    // 3. Generate PDF
    const doc = new jsPDF();
    
    // --- Header ---
    // Attempt to load logo, but don't fail if it fails
    try {
        if (siteSettings.activeLogoPath) {
            const { data: logoData } = supabaseAdmin.storage.from('site-assets').getPublicUrl(siteSettings.activeLogoPath);
            const imgResp = await fetch(logoData.publicUrl);
            if (imgResp.ok) {
                const imgBuffer = await imgResp.arrayBuffer();
                const imgUint8 = new Uint8Array(imgBuffer);
                // Convert to binary string manually to avoid stack overflow on large images
                let binary = '';
                for (let i = 0; i < imgUint8.length; i++) {
                    binary += String.fromCharCode(imgUint8[i]);
                }
                const logoBase64 = btoa(binary);
                
                const ext = siteSettings.activeLogoPath.split('.').pop()?.toLowerCase();
                const format = ext === 'png' ? 'PNG' : 'JPEG';
                doc.addImage(logoBase64, format, 15, 15, 50, 15, undefined, 'FAST'); 
            }
        }
    } catch (e) {
        console.warn("Failed to load logo image, skipping:", e);
    }
    
    // Invoice Title & Details
    doc.setFontSize(22);
    doc.setTextColor(siteSettings.primaryColor);
    doc.text("TAX INVOICE", 195, 20, { align: "right" });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #: ${invoiceNumber}`, 195, 30, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 195, 35, { align: "right" });
    doc.text(`Order ID: ${appOrder.id}`, 195, 40, { align: "right" });

    // --- Sold By & Bill To ---
    const startY = 60;
    
    // Sold By
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
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
    doc.text(appOrder.shippingAddress.name, 110, startY + 5);
    
    const buyerAddr = `${appOrder.shippingAddress.address}, ${appOrder.shippingAddress.locality}, ${appOrder.shippingAddress.city}, ${appOrder.shippingAddress.state} - ${appOrder.shippingAddress.pincode}`;
    const buyerAddrLines = doc.splitTextToSize(buyerAddr, 80);
    doc.text(buyerAddrLines, 110, startY + 10);
    const buyerY = startY + 10 + (buyerAddrLines.length * 4);
    doc.text(`Phone: ${appOrder.shippingAddress.mobile}`, 110, buyerY + 5);

    // --- Items Table ---
    const tableStartY = Math.max(currentY + 15, buyerY + 15);
    
    const tableData = appOrder.items.map((item, index) => [
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
        headStyles: { fillColor: siteSettings.primaryColor },
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
    
    // Prevent writing off the page
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
    doc.text(formatCurrency(appOrder.totalAmount), valuesX, finalY, { align: "right" });
    
    // --- Footer / QR ---
    // Attempt to generate QR
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(`https://awaany.com/#/invoice/${invoiceNumber}`, { 
            errorCorrectionLevel: 'M',
            type: 'image/png',
            margin: 1,
            width: 100
        });
        const qrBase64 = qrCodeDataUrl.split(',')[1];
        
        // Check space for footer
        if (finalY > 240) {
             doc.addPage();
             finalY = 20;
        }

        doc.addImage(qrBase64, 'PNG', 15, finalY, 25, 25);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Scan to verify", 27.5, finalY + 28, { align: 'center' });

        // Upload QR Code for DB record
        const qrBuffer = Uint8Array.from(atob(qrBase64), c => c.charCodeAt(0));
        const qrPath = `invoices/qr/${invoiceNumber}.png`;
        await supabaseAdmin.storage.from('site-assets').upload(qrPath, qrBuffer, { contentType: 'image/png', upsert: true });

        // Save QR Path for later update
        var qrPathForDb = qrPath;

    } catch (e) {
        console.warn("Failed to generate or upload QR code:", e);
    }
    
    // Footer Declaration
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.", 15, pageHeight - 20);
    doc.text("This is a computer generated invoice and does not require a signature.", 15, pageHeight - 15);
    
    // 4. Upload PDF
    const pdfBuffer = doc.output('arraybuffer');
    const pdfPath = `invoices/pdf/${invoiceNumber}.pdf`;
    
    const { data: pdfUploadData, error: pdfUploadError } = await supabaseAdmin.storage
      .from('site-assets')
      .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

    if (pdfUploadError) throw new Error(`Failed to upload PDF: ${pdfUploadError.message}`);

    // 5. Insert/Update Database
    const invoiceData = {
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
      total_amount: appOrder.totalAmount,
      packet_id: packetId,
    };

    // Store invoice record
    const { data: newInvoice, error: insertError } = await supabaseAdmin
      .from('invoices')
      .upsert({
        order_id: appOrder.id,
        user_id: appOrder.userId,
        ...invoiceData,
        pdf_url: pdfUploadData.path,
        // @ts-ignore
        qr_code_url: typeof qrPathForDb !== 'undefined' ? qrPathForDb : null,
      }, { onConflict: 'order_id' })
      .select()
      .single();

    if (insertError) throw new Error(`Failed to save invoice record: ${insertError.message}`);
    
    // Update Order Record
    await supabaseAdmin
      .from('orders')
      .update({
        invoice_number: invoiceNumber,
        downloadable_invoice_url: pdfUploadData.path,
        packet_id: packetId,
      })
      .eq('id', orderId);

    return new Response(JSON.stringify({ invoice: newInvoice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error generating invoice:", error);
    // Return JSON error instead of 500 text to help frontend debugging
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
