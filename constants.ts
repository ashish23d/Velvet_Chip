import { Product, Category, Review, User, Slide, Database } from './types.ts';

export const BUCKETS = {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    SITE_ASSETS: 'site-assets',
    AVATARS: 'avatars',
    REVIEW_IMAGES: 'review-images',
    APP_ASSETS: 'app-assets',
};

export const SITE_ASSETS = {
    LOGIN_HERO: 'awaany_placeholders/auth/login_hero',
};

export const INITIAL_SLIDES: Slide[] = [];

export const PRODUCTS: Product[] = [];

export const REVIEWS: Omit<Review, 'date' | 'status'>[] = [];

// --- Mail Templates ---

type MailTemplateInsert = Database['public']['Tables']['mail_templates']['Insert'];

export const DEFAULT_MAIL_TEMPLATES: MailTemplateInsert[] = [
    {
        name: 'Order Successful',
        subject: 'Your Awaany Order #{{order_id}} has been placed successfully!',
        html_content: `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #C22255; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-family: 'Playfair Display', serif;">Thank You For Your Order!</h2>
    </div>
    <div style="padding: 20px;">
        <p>Hi {{customer_name}},</p>
        <p>We've received your order and are getting it ready for shipment. We'll notify you again once your order has shipped.</p>
        
        <div style="border: 1px solid #eee; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-family: 'Playfair Display', serif; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">Order Summary</h3>
            <p style="margin: 5px 0;"><strong>Order ID:</strong> {{order_id}}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> {{order_date}}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> {{payment_method}}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> <span style="font-weight: bold; color: #C22255;">{{total_amount}}</span></p>
        </div>

        <h3 style="font-family: 'Playfair Display', serif;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead style="background-color: #f8f8f8;">
                <tr>
                    <th style="padding: 10px; text-align: left; font-size: 12px; color: #555;">ITEM</th>
                    <th style="padding: 10px; text-align: center; font-size: 12px; color: #555;">QTY</th>
                    <th style="padding: 10px; text-align: right; font-size: 12px; color: #555;">PRICE</th>
                </tr>
            </thead>
            {{item_list_table}}
        </table>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <table style="width: 100%; max-width: 250px; margin-left: auto; font-size: 14px;">
                <tbody>
                    <tr>
                        <td style="padding: 5px; color: #555;">Subtotal:</td>
                        <td style="padding: 5px; text-align: right;">{{subtotal}}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px; color: #555;">Shipping:</td>
                        <td style="padding: 5px; text-align: right;">{{shipping_fee}}</td>
                    </tr>
                     <tr>
                        <td style="padding: 5px; color: #555;">Discount:</td>
                        <td style="padding: 5px; text-align: right;">- {{discount_amount}}</td>
                    </tr>
                    <tr style="font-weight: bold;">
                        <td style="padding: 8px 5px; border-top: 1px solid #ccc;">Grand Total:</td>
                        <td style="padding: 8px 5px; text-align: right; border-top: 1px solid #ccc;">{{total_amount}}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style="border-top: 1px solid #eee; margin: 20px 0; padding-top: 20px;">
            <h3 style="margin-top: 0; font-family: 'Playfair Display', serif;">Shipping To:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">{{shipping_address}}</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <a href="{{tracking_link}}" style="display: inline-block; padding: 12px 25px; background-color: #C22255; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Status</a>
        </div>
    </div>
    <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>&copy; ${new Date().getFullYear()} Awaany. All Rights Reserved.</p>
    </div>
</div>`,
        template_type: 'order_status',
        placeholders: {
            '{{customer_name}}': 'The full name of the customer.',
            '{{order_id}}': 'The unique ID of the order.',
            '{{order_date}}': 'The date the order was placed.',
            '{{total_amount}}': 'The total amount of the order (e.g., ₹1,299.00).',
            '{{shipping_address}}': 'The full shipping address as a block of text.',
            '{{tracking_link}}': 'A link to track the order shipment.',
            '{{payment_method}}': 'The payment method used (e.g., COD, Online).',
            '{{item_list_table}}': 'An HTML table body (tbody) with rows (tr) for each item.',
            '{{subtotal}}': 'The subtotal of all items before discounts and shipping.',
            '{{shipping_fee}}': 'The shipping fee for the order.',
            '{{discount_amount}}': 'The discount amount applied to the order.',
        },
        is_active: true,
    },
    {
        name: 'Order Shipped',
        subject: 'Your Awaany Order #{{order_id}} Has Shipped!',
        html_content: `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #C22255; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-family: 'Playfair Display', serif;">Your Order is on its Way!</h2>
    </div>
    <div style="padding: 20px;">
        <p>Hi {{customer_name}},</p>
        <p>Good news! Your order #{{order_id}} has been shipped and is on its way to you. You can track your package using the link below.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{tracking_link}}" style="display: inline-block; padding: 12px 25px; background-color: #C22255; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order</a>
        </div>
        <div style="border-top: 1px solid #eee; margin: 20px 0; padding-top: 20px;">
            <h3 style="margin-top: 0; font-family: 'Playfair Display', serif;">Shipping To:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">{{shipping_address}}</p>
        </div>
        <p>We hope you love your new items!</p>
    </div>
    <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>&copy; ${new Date().getFullYear()} Awaany. All Rights Reserved.</p>
    </div>
</div>`,
        template_type: 'order_status',
        placeholders: {
            '{{customer_name}}': 'The full name of the customer.',
            '{{order_id}}': 'The unique ID of the order.',
            '{{shipping_address}}': 'The full shipping address as a block of text.',
            '{{tracking_link}}': 'A link to track the order shipment.',
        },
        is_active: true,
    },
    {
        name: 'Password Reset',
        subject: 'Reset Your Awaany Password',
        html_content: `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #C22255; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-family: 'Playfair Display', serif;">Password Reset Request</h2>
    </div>
    <div style="padding: 20px;">
        <p>Hello,</p>
        <p>We received a request to reset the password for your Awaany account. Please click the button below to set a new password.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 25px; background-color: #C22255; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Your Password</a>
        </div>
        <p>If you did not request a password reset, please ignore this email. This link is valid for one hour.</p>
    </div>
    <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>&copy; ${new Date().getFullYear()} Awaany. All Rights Reserved.</p>
    </div>
</div>`,
        template_type: 'password_reset',
        placeholders: {
            '{{ .ConfirmationURL }}': 'The unique URL for the user to reset their password. (Handled by Supabase)',
        },
        is_active: true,
    }
];