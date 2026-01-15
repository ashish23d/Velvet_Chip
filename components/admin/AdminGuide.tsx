import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface GuideSection {
    title: string;
    content: string | React.ReactNode;
}

const AdminGuide: React.FC = () => {
    const [openSection, setOpenSection] = useState<number | null>(0);

    const sections: GuideSection[] = [
        {
            title: "Getting Started",
            content: (
                <div className="space-y-3">
                    <p>Welcome to the Admin Panel! This guide will help you manage your e-commerce store effectively.</p>
                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Dashboard Overview</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><strong>Dashboard:</strong> View key metrics, recent orders, and low-stock alerts</li>
                        <li><strong>Products:</strong> Manage your product catalog</li>
                        <li><strong>Orders:</strong> Process and track customer orders</li>
                        <li><strong>Categories:</strong> Organize products into categories</li>
                        <li><strong>Users:</strong> Manage customer accounts and permissions</li>
                    </ul>
                </div>
            )
        },
        {
            title: "Managing Products",
            content: (
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Adding a New Product</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li>Navigate to <strong>Products</strong> → Click <strong>Add Product</strong></li>
                        <li>Fill in basic details: Name, Description, Category</li>
                        <li>Set pricing: MRP (original price) and Sale Price</li>
                        <li>Add <strong>Variants</strong> (Colors, Sizes, Stock):
                            <ul className="list-disc pl-5 mt-1">
                                <li>Each color can have multiple sizes</li>
                                <li>Upload images specific to each color variant</li>
                                <li>Set stock levels for each size</li>
                            </ul>
                        </li>
                        <li><strong>Dynamic Attributes</strong>: Add custom attributes like Brand, Material, Fabric
                            <ul className="list-disc pl-5 mt-1">
                                <li>These automatically appear as filters on category pages</li>
                                <li>Example: Brand: Nike, Material: Cotton</li>
                            </ul>
                        </li>
                        <li><strong>Customization</strong>: Enable if customers can add special instructions (e.g., engraving)</li>
                        <li>Click <strong>Save Product</strong></li>
                    </ol>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Product Images</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Upload high-quality images (recommended: 1000x1000px or higher)</li>
                        <li>Add multiple images per color variant to show different angles</li>
                        <li>Images are automatically optimized and stored in Supabase Storage</li>
                    </ul>
                </div>
            )
        },
        {
            title: "Dynamic Filters & Attributes",
            content: (
                <div className="space-y-3">
                    <p>The system supports <strong>dynamic filtering</strong> based on product attributes you define.</p>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">How It Works</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li>When editing a product, scroll to the <strong>Product Attributes</strong> section</li>
                        <li>Click <strong>Add Attribute</strong> and enter a name (e.g., "Brand", "Material", "Sleeve Type")</li>
                        <li>Enter the value for that product (e.g., "Nike", "Cotton", "Long Sleeve")</li>
                        <li>The attribute will automatically appear as a filter option on the category page</li>
                    </ol>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Use Cases</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><strong>Clothing:</strong> Brand, Fabric, Sleeve Type, Fit, Occasion</li>
                        <li><strong>Electronics:</strong> Brand, RAM, Storage, Screen Size, Processor</li>
                        <li><strong>Cakes/Food:</strong> Flavor, Egg/Eggless, Dietary (Vegan, Gluten-Free)</li>
                        <li><strong>Furniture:</strong> Material, Color, Style, Room Type</li>
                    </ul>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 mt-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Tip:</strong> Keep attribute names consistent across products (e.g., always use "Brand" not "brand" or "BRAND") for proper filter grouping.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Processing Orders",
            content: (
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Order Workflow</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li><strong>New Order:</strong> Appears in Orders list with status "Processing"</li>
                        <li><strong>Review Order:</strong> Click to view details, customer info, and items</li>
                        <li><strong>Update Status:</strong> Change to Confirmed → Shipped → Delivered
                            <ul className="list-disc pl-5 mt-1">
                                <li>Customer receives email notifications for each status change</li>
                            </ul>
                        </li>
                        <li><strong>Add Tracking:</strong> Enter courier name and tracking number for shipments</li>
                        <li><strong>Generate Invoice:</strong> Click "Generate Invoice" to create a PDF</li>
                    </ol>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Handling Returns</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Returns appear in the <strong>Returns</strong> section</li>
                        <li>Review customer reason and uploaded images</li>
                        <li>Approve or Reject the return request</li>
                        <li>Update status to "Picked Up" → "Refunded" as appropriate</li>
                    </ul>
                </div>
            )
        },
        {
            title: "Managing Categories",
            content: (
                <div className="space-y-3">
                    <p>Categories help organize your products and improve navigation.</p>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Creating a Category</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li>Go to <strong>Categories</strong> → <strong>Add Category</strong></li>
                        <li>Enter category name (e.g., "Cakes", "Clothing", "Electronics")</li>
                        <li>Upload a hero image for the category page</li>
                        <li>Optionally add hero text overlay</li>
                        <li>Save the category</li>
                    </ol>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Category Page Customization</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><strong>Hero Media:</strong> Upload an image or video banner</li>
                        <li><strong>Hero Text:</strong> Add promotional text overlay</li>
                        <li><strong>Card Addons:</strong> Add promotional cards/banners within category pages</li>
                    </ul>
                </div>
            )
        },
        {
            title: "Site Settings & Customization",
            content: (
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Branding</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><strong>Logo:</strong> Upload your logo (supports images, GIFs, or videos)</li>
                        <li><strong>Colors:</strong> Set primary brand color and hover color</li>
                        <li><strong>Text Logo:</strong> Use text instead of an image with custom fonts</li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Email Configuration</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Set sender email and name for order confirmations</li>
                        <li>Ensure the email is verified in SendGrid</li>
                        <li>Customize email templates in <strong>Mail Templates</strong></li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Contact Details</h4>
                    <p className="text-sm">Update your business email, phone, and address displayed in the footer.</p>
                </div>
            )
        },
        {
            title: "Stock Management & Notifications",
            content: (
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Stock Tracking</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Stock is tracked per size/color variant</li>
                        <li>When an order is placed, stock is automatically deducted</li>
                        <li>Low stock alerts appear on the Dashboard</li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Out of Stock Handling</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Products with zero stock are hidden from the website by default</li>
                        <li>Users can toggle "Include Out of Stock" to view them</li>
                        <li>Admins receive notifications when products go out of stock</li>
                    </ul>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3 mt-4">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>Important:</strong> Regularly check the Dashboard for low-stock alerts to avoid disappointing customers.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Promotions & Discounts",
            content: (
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Creating Promo Codes</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li>Navigate to <strong>Promotions</strong> → <strong>Add Promotion</strong></li>
                        <li>Enter promo code (e.g., "SAVE20")</li>
                        <li>Choose type: Percentage or Fixed Amount</li>
                        <li>Set discount value</li>
                        <li>Optional: Set minimum purchase amount and usage limit</li>
                        <li>Set expiry date</li>
                        <li>Activate the promotion</li>
                    </ol>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Managing Active Promotions</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>View all promotions and their usage statistics</li>
                        <li>Toggle promotions active/inactive</li>
                        <li>Edit or delete expired promotions</li>
                    </ul>
                </div>
            )
        },
        {
            title: "CMS & Content Management",
            content: (
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Homepage Customization</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><strong>Hero Slider:</strong> Add/edit homepage banner slides</li>
                        <li><strong>Seasonal Cards:</strong> Promote specific products or collections</li>
                        <li><strong>Card Addons:</strong> Insert custom content blocks (banners, videos, product grids)</li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Announcement Bar</h4>
                    <p className="text-sm">Set a site-wide announcement that appears at the top of every page (e.g., "Free Shipping on Orders Over ₹500").</p>
                </div>
            )
        },
        {
            title: "Deployment & Technical",
            content: (
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Deploying Backend Functions</h4>
                    <p className="text-sm">Some features require deploying Supabase Edge Functions. Use the commands in <strong>Settings → Developer & Deployment</strong>.</p>

                    <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Database Migrations</h4>
                    <p className="text-sm">If you've added the <code>attributes</code> column for dynamic filters, run the SQL migration:</p>
                    <code className="block bg-gray-900 text-gray-100 text-xs p-3 rounded font-mono mt-2">
                        -- Run in Supabase SQL Editor<br />
                        -- File: supabase/migrations/add_product_attributes.sql
                    </code>

                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 mt-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Caution:</strong> Always backup your database before running migrations. Test in a development environment first.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    const toggleSection = (index: number) => {
        setOpenSection(openSection === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel Guide</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Comprehensive guide to managing your e-commerce store
                </p>
            </div>

            <div className="space-y-3">
                {sections.map((section, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
                    >
                        <button
                            onClick={() => toggleSection(index)}
                            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-left">
                                {section.title}
                            </h3>
                            {openSection === index ? (
                                <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                            )}
                        </button>

                        {openSection === index && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                {section.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-pink-100 dark:from-primary/20 dark:to-pink-900/20 rounded-lg border border-primary/20">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    If you encounter any issues or need assistance, please contact your development team or refer to the technical documentation.
                </p>
            </div>
        </div>
    );
};

export default AdminGuide;
