
import React, { useEffect, useRef } from 'react';
import { Order, ContactDetails } from '../../types';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface ShippingLabelProps {
    order: Order;
    contactDetails: ContactDetails;
}

const ShippingLabel: React.FC<ShippingLabelProps> = ({ order, contactDetails }) => {
    const barcodeRef = useRef<SVGSVGElement>(null);
    const qrCodeRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // 1. Generate Barcode (Code 128)
        if (barcodeRef.current && order.id) {
            try {
                JsBarcode(barcodeRef.current, order.id, {
                    format: "CODE128",
                    lineColor: "#000",
                    width: 2,
                    height: 50,
                    displayValue: true,
                    fontSize: 12,
                    margin: 0
                });
            } catch (e) {
                console.error("Barcode generation error", e);
            }
        }

        // 2. Generate QR Code
        if (qrCodeRef.current && order.id) {
            // Use hash routing for the tracking URL
            const trackingUrl = `${window.location.origin}/#/track-order/${order.id}`;
            QRCode.toCanvas(qrCodeRef.current, trackingUrl, {
                width: 80,
                margin: 0
            }, (error) => {
                if (error) console.error("QR Code generation error:", error);
            });
        }
    }, [order.id]);

    return (
        <div className="w-[4in] h-[6in] bg-white border border-gray-300 shadow-sm p-4 flex flex-col font-sans box-border relative overflow-hidden mx-auto">
            {/* Top Bar: Courier Info Placeholder */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                <div className="font-bold text-2xl uppercase">
                    Standard
                </div>
                <div className="text-right">
                    <h2 className="font-bold text-lg">{order.payment.method === 'COD' ? 'COD' : 'PREPAID'}</h2>
                    <p className="text-xs font-mono">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Delivery Address (Big) */}
            <div className="flex-grow">
                <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Ship To:</p>
                <div className="ml-2">
                    <p className="font-bold text-lg leading-tight uppercase">{order.shippingAddress.name}</p>
                    <p className="text-sm leading-snug mt-1">
                        {order.shippingAddress.address}, {order.shippingAddress.locality}
                    </p>
                    <p className="text-sm font-bold mt-1">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p className="text-2xl font-bold mt-1 tracking-wider">{order.shippingAddress.pincode}</p>
                    <p className="text-sm mt-1 font-semibold">Tel: {order.shippingAddress.mobile}</p>
                </div>
            </div>

            {/* Middle Section: Barcode */}
            <div className="border-t-2 border-b-2 border-black py-4 my-2 flex flex-col items-center justify-center">
                <svg ref={barcodeRef} className="w-full h-16"></svg>
                <p className="text-[10px] mt-1 uppercase">Tracking ID (Order Ref)</p>
            </div>

            {/* Bottom Section: Return Address & QR */}
            <div className="flex justify-between items-end pt-2">
                <div className="text-[10px] w-2/3">
                    <p className="uppercase text-gray-500 font-bold mb-1">Return To (Sender):</p>
                    <p className="font-bold">Awaany Fashions</p>
                    <p>{contactDetails.address}</p>
                    <p className="mt-1">Pin: 400053</p>
                </div>
                
                <div className="flex flex-col items-center w-1/3">
                    <canvas ref={qrCodeRef} className="mb-1"></canvas>
                    <p className="text-[8px] text-center font-medium">Scan for Invoice</p>
                </div>
            </div>
            
            {/* Visual Cut Line */}
            <div className="absolute bottom-0 left-0 w-full text-center text-[10px] text-gray-300 border-t border-dashed">
                Cut Here
            </div>
        </div>
    );
};

export default ShippingLabel;
