
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { ArrowDownTrayIcon, PrinterIcon, EyeIcon, TagIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import JSZip from 'jszip';
import { supabase } from '../../services/supabaseClient.ts';
import { BUCKETS } from '../../constants.ts';
import DocumentPreviewModal from '../../components/admin/DocumentPreviewModal.tsx';
import { Order, Invoice } from '../../types.ts';
import { generateShippingLabelPDF } from '../../utils/labelGenerator.ts';

const InvoicesPage: React.FC = () => {
    const { adminData, generateInvoice, getAllPromotions, siteSettings, contactDetails } = useAppContext();
    const navigate = useNavigate();

    // --- Filter States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'generated' | 'pending'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

    // --- Action States ---
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null); // Tracks row currently downloading
    const [error, setError] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Preview States ---
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
    const [previewInvoice, setPreviewInvoice] = useState<Invoice | undefined>(undefined);

    const ordersWithInvoiceStatus = useMemo(() => {
        const orders = adminData?.orders || [];
        const invoices = adminData?.invoices || [];
        const invoiceMap = new Map(invoices.map(inv => [inv.order_id, inv]));

        // 1. Map Data
        let processed = orders.map(order => ({
            ...order,
            invoice: invoiceMap.get(order.id)
        }));

        // 2. Text Search
        // TRIM applied here to fix copy-paste issues
        const lowerSearchTerm = searchTerm.trim().toLowerCase();
        if (lowerSearchTerm) {
            processed = processed.filter(order =>
                (order.id && order.id.toLowerCase().includes(lowerSearchTerm)) ||
                (order.customerName && order.customerName.toLowerCase().includes(lowerSearchTerm)) ||
                (order.invoice?.invoice_number && order.invoice.invoice_number.toLowerCase().includes(lowerSearchTerm))
            );
        }

        // 3. Status Filter
        if (statusFilter !== 'all') {
            processed = processed.filter(order => {
                if (statusFilter === 'generated') return !!order.invoice;
                if (statusFilter === 'pending') return !order.invoice;
                return true;
            });
        }

        // 4. Date Filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter !== 'all') {
            processed = processed.filter(order => {
                const orderDate = new Date(order.orderDate);
                orderDate.setHours(0, 0, 0, 0);

                switch (dateFilter) {
                    case 'today':
                        return orderDate.getTime() === today.getTime();
                    case 'yesterday':
                        const yest = new Date(today);
                        yest.setDate(yest.getDate() - 1);
                        return orderDate.getTime() === yest.getTime();
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return orderDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return orderDate >= monthAgo;
                    case 'custom':
                        const start = customStartDate ? new Date(customStartDate) : null;
                        const end = customEndDate ? new Date(customEndDate) : null;
                        if (start) start.setHours(0, 0, 0, 0);
                        if (end) end.setHours(23, 59, 59, 999);

                        if (start && end) return orderDate >= start && orderDate <= end;
                        if (start) return orderDate >= start;
                        if (end) return orderDate <= end;
                        return true;
                    default:
                        return true;
                }
            });
        }

        // 5. Amount Filter
        if (minAmount || maxAmount) {
            const min = minAmount ? parseFloat(minAmount) : 0;
            const max = maxAmount ? parseFloat(maxAmount) : Infinity;
            processed = processed.filter(order => order.totalAmount >= min && order.totalAmount <= max);
        }

        // 6. Sorting
        processed.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
                case 'amount-desc':
                    return b.totalAmount - a.totalAmount;
                case 'amount-asc':
                    return a.totalAmount - b.totalAmount;
                case 'date-desc':
                default:
                    return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
            }
        });

        return processed;
    }, [adminData, searchTerm, statusFilter, dateFilter, customStartDate, customEndDate, minAmount, maxAmount, sortBy]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter('all');
        setCustomStartDate('');
        setCustomEndDate('');
        setMinAmount('');
        setMaxAmount('');
        setSortBy('date-desc');
    };

    const handleGenerate = async (orderId: string) => {
        setIsGenerating(orderId);
        setError(null);
        try {
            await generateInvoice(orderId);
        } catch (err: any) {
            setError(err.message || 'Failed to generate invoice.');
        } finally {
            setIsGenerating(null);
        }
    };

    // Checkbox Handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const validIds = ordersWithInvoiceStatus.map(o => o.id);
            setSelectedOrderIds(validIds);
        } else {
            setSelectedOrderIds([]);
        }
    };

    const handleSelectOne = (orderId: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    // --- Bulk Print Actions ---
    const handleBulkPrintInvoices = () => {
        if (selectedOrderIds.length === 0) return;
        const url = `/#/print/bulk-documents?mode=invoice&ids=${selectedOrderIds.join(',')}`;
        window.open(url, '_blank');
    };

    const handleBulkPrintLabels = () => {
        if (selectedOrderIds.length === 0) return;
        const url = `/#/print/bulk-documents?mode=label&ids=${selectedOrderIds.join(',')}`;
        window.open(url, '_blank');
    };

    // --- Bulk Download Actions ---
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const triggerDownload = (blob: Blob | MediaSource, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        // Removed target="_blank" to prevent popup blocking for direct downloads
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 1000);
    };

    const handleBulkDownloadInvoicesZip = async () => {
        if (selectedOrderIds.length === 0 || !adminData) return;
        setIsProcessing(true);
        try {
            const zip = new JSZip();
            const folder = zip.folder("invoices");
            let count = 0;

            const promises = selectedOrderIds.map(async (orderId) => {
                const item = adminData.invoices.find(inv => inv.order_id === orderId);
                // Try clean path first, then raw path
                if (item?.pdf_url) {
                    try {
                        const { data, error } = await supabase.storage.from(BUCKETS.SITE_ASSETS).download(item.pdf_url);
                        if (data && !error) {
                            folder?.file(`${item.invoice_number}.pdf`, data);
                            count++;
                            return;
                        } else {
                            // Fallback: try stripping spaces from path if it fails
                            const cleanPath = item.pdf_url.replace(/\s+/g, '');
                            if (cleanPath !== item.pdf_url) {
                                const { data: cleanData, error: cleanError } = await supabase.storage.from(BUCKETS.SITE_ASSETS).download(cleanPath);
                                if (cleanData && !cleanError) {
                                    folder?.file(`${item.invoice_number}.pdf`, cleanData);
                                    count++;
                                    return;
                                }
                            }
                            console.warn(`Failed to download invoice for ${orderId}:`, error);
                        }
                    } catch (err) {
                        console.error(`Exception downloading invoice for ${orderId}:`, err);
                    }
                }
            });

            // Use allSettled to ensure we wait for all, regardless of failures
            await Promise.allSettled(promises);

            if (count === 0) {
                alert("No invoice PDFs found for the selected orders. Please generate them first.");
                return;
            }
            const content = await zip.generateAsync({ type: "blob" });
            triggerDownload(content, `invoices_archive_${new Date().toISOString().split('T')[0]}.zip`);
        } catch (e) {
            console.error("Error zipping invoices:", e);
            alert("Failed to create invoice zip file.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkDownloadInvoicesIndividual = async () => {
        if (selectedOrderIds.length === 0) {
            alert("Please select at least one order.");
            return;
        }
        if (!adminData) return;

        const invoiceTargets = selectedOrderIds
            .map(id => adminData.invoices.find(inv => inv.order_id === id))
            .filter(inv => !!inv?.pdf_url);

        if (invoiceTargets.length === 0) {
            alert("None of the selected orders have invoices generated yet.");
            return;
        }

        if (!confirm(`You are about to download ${invoiceTargets.length} files sequentially.\n\nPlease allow "Automatic Downloads" if your browser prompts you.`)) return;

        setIsProcessing(true);
        let downloadedCount = 0;

        try {
            for (const item of invoiceTargets) {
                if (item?.pdf_url) {
                    try {
                        let blob = null;
                        const { data, error } = await supabase.storage.from(BUCKETS.SITE_ASSETS).download(item.pdf_url);
                        if (data && !error) {
                            blob = data;
                        } else {
                            // Retry with clean path
                            const cleanPath = item.pdf_url.replace(/\s+/g, '');
                            if (cleanPath !== item.pdf_url) {
                                const { data: cleanData, error: cleanError } = await supabase.storage.from(BUCKETS.SITE_ASSETS).download(cleanPath);
                                if (cleanData && !cleanError) blob = cleanData;
                            }
                        }

                        if (blob) {
                            triggerDownload(blob, `${item.invoice_number}.pdf`);
                            downloadedCount++;
                            await delay(1000); // Reduced delay slightly
                        } else {
                            console.error(`Failed to download invoice for ${item.order_id}`);
                        }
                    } catch (innerErr) {
                        console.error(`Error downloading invoice for order ${item.order_id}`, innerErr);
                    }
                }
            }
        } catch (e) {
            console.error("Error in bulk invoice download loop:", e);
        } finally {
            setIsProcessing(false);
            if (downloadedCount === 0) {
                alert("No invoices were downloaded. Check console for errors.");
            }
        }
    };

    const handleBulkDownloadLabelsZip = async () => {
        if (selectedOrderIds.length === 0 || !adminData) return;
        setIsProcessing(true);
        try {
            const zip = new JSZip();
            const folder = zip.folder("labels");
            let count = 0;
            const promises = selectedOrderIds.map(async (orderId) => {
                const order = adminData.orders.find(o => o.id === orderId);
                if (order) {
                    try {
                        const labelBlob = await generateShippingLabelPDF(order, contactDetails || { email: '', phone: '', address: '' });
                        folder?.file(`Label-${order.id}.pdf`, labelBlob);
                        count++;
                    } catch (err) {
                        console.error(`Failed to generate label for ${orderId}`, err);
                    }
                }
            });
            await Promise.all(promises);
            if (count === 0) {
                alert("Failed to generate labels. Please check the orders.");
                return;
            }
            const content = await zip.generateAsync({ type: "blob" });
            triggerDownload(content, `labels_archive_${new Date().toISOString().split('T')[0]}.zip`);
        } catch (e) {
            console.error("Error zipping labels:", e);
            alert("Failed to create labels zip file.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkDownloadLabelsIndividual = async () => {
        if (selectedOrderIds.length === 0) {
            alert("Please select at least one order.");
            return;
        }
        if (!adminData) return;
        if (!confirm(`You are about to download ${selectedOrderIds.length} shipping labels sequentially.\n\nPlease allow "Automatic Downloads" if your browser prompts you.`)) return;

        setIsProcessing(true);
        let downloadedCount = 0;
        try {
            for (const orderId of selectedOrderIds) {
                const order = adminData.orders.find(o => o.id === orderId);
                if (order) {
                    try {
                        const labelBlob = await generateShippingLabelPDF(order, contactDetails || { email: '', phone: '', address: '' });
                        triggerDownload(labelBlob, `Label-${order.id}.pdf`);
                        downloadedCount++;
                        await delay(1500);
                    } catch (err) {
                        console.error(`Error generating label for ${orderId}:`, err);
                    }
                }
            }
        } catch (e) {
            console.error("Error in bulk label download loop:", e);
        } finally {
            setIsProcessing(false);
            if (downloadedCount === 0) {
                alert("No labels were generated. Please try again.");
            }
        }
    };

    const handleDownloadSingleLabel = async (orderId: string) => {
        const order = adminData?.orders.find(o => o.id === orderId);
        if (!order) return;
        setDownloadingId(`label-${orderId}`);
        try {
            const blob = await generateShippingLabelPDF(order, contactDetails || { email: '', phone: '', address: '' });
            triggerDownload(blob, `Label-${order.id}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Failed to download label.");
        } finally {
            setDownloadingId(null);
        }
    }

    const handleDownloadSingleInvoice = async (orderId: string) => {
        const item = adminData?.invoices.find(inv => inv.order_id === orderId);
        if (!item?.pdf_url) {
            alert("Invoice PDF not found. Please generate it first.");
            return;
        }
        setDownloadingId(`invoice-${orderId}`);
        try {
            const { data, error } = await supabase.storage.from(BUCKETS.SITE_ASSETS).download(item.pdf_url);
            if (data && !error) {
                triggerDownload(data, `${item.invoice_number}.pdf`);
            } else {
                throw new Error(error?.message || "Download failed");
            }
        } catch (e: any) {
            console.error("Error downloading invoice:", e);
            alert(`Failed to download invoice: ${e.message}`);
        } finally {
            setDownloadingId(null);
        }
    }

    const handlePreview = (order: Order, invoice: Invoice) => {
        setPreviewOrder(order);
        setPreviewInvoice(invoice);
        setIsPreviewOpen(true);
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        setPreviewOrder(null);
        setPreviewInvoice(undefined);
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 pb-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Invoices & Labels</h1>
                {/* Reset Filters Button */}
                <button
                    onClick={handleResetFilters}
                    className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                    <XMarkIcon className="w-4 h-4" /> Reset Filters
                </button>
            </div>

            {/* Filtration Bar */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Search */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                    <input
                        type="text"
                        placeholder="Order ID, Customer, Invoice #..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                    />
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                    >
                        <option value="all">All Statuses</option>
                        <option value="generated">Generated</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {/* Date Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                {/* Sort By */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="amount-desc">Amount: High to Low</option>
                        <option value="amount-asc">Amount: Low to High</option>
                    </select>
                </div>

                {/* Custom Date Inputs (Conditional) */}
                {dateFilter === 'custom' && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                )}

                {/* Amount Range */}
                <div className="col-span-1 md:col-span-2 flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Min Amount</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Max Amount</label>
                        <input
                            type="number"
                            placeholder="Any"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">{error}</div>}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 w-4">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                    onChange={handleSelectAll}
                                    checked={selectedOrderIds.length > 0 && selectedOrderIds.length === ordersWithInvoiceStatus.length}
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ordersWithInvoiceStatus.map((item) => {
                            const { id: orderId, customerName, invoice } = item;
                            return (
                                <tr key={orderId} className={selectedOrderIds.includes(orderId) ? 'bg-primary/5' : ''}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            checked={selectedOrderIds.includes(orderId)}
                                            onChange={() => handleSelectOne(orderId)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                        <Link to={`/admin/orders/${orderId}`} className="hover:underline">#{orderId}</Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customerName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">₹{item.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{invoice?.invoice_number || 'Pending'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(item.orderDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {invoice ? (
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleDownloadSingleInvoice(orderId)}
                                                    className="text-gray-500 hover:text-primary disabled:opacity-50"
                                                    disabled={!!downloadingId}
                                                    title="Download Invoice"
                                                >
                                                    {downloadingId === `invoice-${orderId}` ? '...' : <ArrowDownTrayIcon className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadSingleLabel(orderId)}
                                                    className="text-gray-500 hover:text-primary disabled:opacity-50"
                                                    disabled={!!downloadingId}
                                                    title="Download Label"
                                                >
                                                    {downloadingId === `label-${orderId}` ? '...' : <TagIcon className="w-5 h-5" />}
                                                </button>
                                                <button onClick={() => handlePreview(item as any, invoice)} className="text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded flex items-center gap-1">
                                                    <EyeIcon className="w-4 h-4" /> View
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleGenerate(orderId)}
                                                disabled={isGenerating === orderId}
                                                className="bg-primary text-white text-xs py-1 px-3 rounded-md font-medium hover:bg-pink-700 disabled:bg-gray-400"
                                            >
                                                {isGenerating === orderId ? 'Generating...' : 'Generate'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {ordersWithInvoiceStatus.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No orders match your filters.
                    </div>
                )}
            </div>

            {/* Bulk Action Bar */}
            {selectedOrderIds.length > 0 && (
                <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-4 border-t flex flex-wrap items-center justify-between gap-4 z-20 animate-slide-in-down">
                    <p className="text-sm font-medium text-gray-700 hidden sm:block">{selectedOrderIds.length} selected</p>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">

                        {/* Print Group */}
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-md border border-gray-200">
                            <span className="text-xs font-semibold text-gray-400 uppercase px-2">Print</span>
                            <button
                                onClick={handleBulkPrintInvoices}
                                className="flex items-center gap-1 bg-white text-gray-700 py-1.5 px-3 rounded shadow-sm text-xs sm:text-sm font-medium hover:text-primary"
                            >
                                <PrinterIcon className="w-4 h-4" /> Invoices
                            </button>
                            <button
                                onClick={handleBulkPrintLabels}
                                className="flex items-center gap-1 bg-white text-gray-700 py-1.5 px-3 rounded shadow-sm text-xs sm:text-sm font-medium hover:text-primary"
                            >
                                <TagIcon className="w-4 h-4" /> Labels
                            </button>
                        </div>

                        {/* Download Group Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 bg-primary text-white py-1.5 px-4 rounded-md shadow-sm text-xs sm:text-sm font-medium hover:bg-pink-700 disabled:opacity-50 disabled:bg-gray-400" disabled={isProcessing}>
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                {isProcessing ? 'Processing...' : 'Download'}
                            </button>
                            <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-md shadow-xl border border-gray-200 hidden group-hover:block z-30">
                                <div className="py-1">
                                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Invoices</div>
                                    <button onClick={handleBulkDownloadInvoicesZip} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary">Download as ZIP</button>
                                    <button onClick={handleBulkDownloadInvoicesIndividual} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary">Download Individual Files</button>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Shipping Labels</div>
                                    <button onClick={handleBulkDownloadLabelsZip} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary">Download as ZIP</button>
                                    <button onClick={handleBulkDownloadLabelsIndividual} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary">Download Individual Files</button>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setSelectedOrderIds([])} className="text-sm text-gray-500 hover:underline ml-2">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {previewOrder && (
                <DocumentPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={closePreview}
                    order={previewOrder}
                    promotions={getAllPromotions()}
                    siteSettings={siteSettings}
                    contactDetails={contactDetails}
                    invoiceData={previewInvoice}
                />
            )}
        </div>
    );
};

export default InvoicesPage;
