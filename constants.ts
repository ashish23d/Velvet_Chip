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

export const INITIAL_SLIDES: Slide[] = [
    { id: 'slide-1', media: [{ path: 'awaany_placeholders/hero/1', type: 'image' }], text: 'Discover Your Signature Style', showText: true },
    { id: 'slide-2', media: [{ path: 'awaany_placeholders/hero/2', type: 'image' }], text: 'Elegance in Every Thread', showText: true },
    { id: 'slide-3', media: [{ path: 'awaany_placeholders/hero/3', type: 'image' }], text: 'New Season, New You', showText: true },
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    uuid: "d1f5b5f8-8a2a-4a2e-8f3b-1b9e8b0a1b9e",
    name: 'Elegant Floral Maxi Dress',
    category: 'western-dresses',
    price: 1299,
    mrp: 2499,
    rating: 4.5,
    reviews: 150,
    description: 'A beautiful floral maxi dress perfect for summer evenings. Made with lightweight, breathable fabric for maximum comfort.',
    images: ['awaany_placeholders/products/1/pink_1', 'awaany_placeholders/products/1/pink_2', 'awaany_placeholders/products/1/blue_1'],
    colors: [
        { name: 'Blush Pink', hex: '#E6A4B4', uuid: "c1a4e5f6-8a2a-4a2e-8f3b-1b9e8b0a1b9e", images: ['awaany_placeholders/products/1/pink_1', 'awaany_placeholders/products/1/pink_2'] },
        { name: 'Sky Blue', hex: '#A5C0DD', uuid: "b1d4e5f6-8a2a-4a2e-8f3b-1b9e8b0a1b9e", images: ['awaany_placeholders/products/1/blue_1'] }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    specifications: { 'Sleeve Length': 'Sleeveless', 'Shape': 'A-Line', 'Neck': 'V-Neck', 'Print or Pattern Type': 'Floral', 'Length': 'Maxi', 'Hemline': 'Flared' },
    hsnCode: '6204',
  },
  {
    id: 2,
    uuid: "e2f6c6g9-9b3b-5b3f-9g4c-2c1f9c1b2cae",
    name: 'Chikankari Straight Kurta',
    category: 'kurtas',
    price: 1899,
    mrp: 3999,
    rating: 4.8,
    reviews: 210,
    description: 'Exquisite Chikankari embroidery on a soft cotton base. This straight kurta offers a blend of traditional craftsmanship and modern elegance.',
    images: ['awaany_placeholders/products/2/white_1', 'awaany_placeholders/products/2/white_2', 'awaany_placeholders/products/2/green_1'],
    colors: [
        { name: 'Ivory White', hex: '#FFFFF0', uuid: "d2a5f6g7-9b3b-5b3f-9g4c-2c1f9c1b2cae", images: ['awaany_placeholders/products/2/white_1', 'awaany_placeholders/products/2/white_2'] },
        { name: 'Pastel Green', hex: '#B2D8B2', uuid: "c2b6g7h8-9b3b-5b3f-9g4c-2c1f9c1b2cae", images: ['awaany_placeholders/products/2/green_1'] }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: { 'Sleeve Length': 'Three-Quarter Sleeves', 'Shape': 'Straight', 'Neck': 'Round Neck', 'Design Styling': 'Regular', 'Slit Detail': 'Side Slits', 'Ornamentation': 'Chikankari', 'Length': 'Calf Length', 'Hemline': 'Straight' },
    hsnCode: '6206',
  },
  {
    id: 3,
    uuid: "f3g7d7h0-0c4c-6c4g-0h5d-3d2g0d2c3dbf",
    name: 'Silk Blend Banarasi Saree',
    category: 'sarees',
    price: 4999,
    mrp: 9999,
    rating: 4.9,
    reviews: 85,
    description: 'A luxurious Banarasi saree woven with fine silk blend and intricate zari work. Perfect for weddings and festive occasions.',
    images: ['awaany_placeholders/products/3/blue_1'],
    colors: [
        { name: 'Royal Blue', hex: '#4169E1', uuid: "e3b6h8i9-0c4c-6c4g-0h5d-3d2g0d2c3dbf", images: ['awaany_placeholders/products/3/blue_1', 'awaany_placeholders/products/3/blue_2'] },
        { name: 'Maroon', hex: '#800000', uuid: "d3c7i9j0-0c4c-6c4g-0h5d-3d2g0d2c3dbf", images: ['awaany_placeholders/products/3/maroon_1'] }
    ],
    sizes: ['Free Size'],
    specifications: { 'Type': 'Banarasi', 'Fabric': 'Silk Blend', 'Pattern': 'Woven Design', 'Border': 'Zari', 'Saree Length': '5.5 metres', 'Blouse': 'Unstitched Blouse Piece' },
    hsnCode: '5007',
  },
  {
    id: 4,
    uuid: "g4h8e8i1-1d5d-7d5h-1i6e-4e3h1e3d4ecg",
    name: 'High-Waist Flared Pants',
    category: 'pants',
    price: 999,
    mrp: 1999,
    rating: 4.2,
    reviews: 95,
    description: 'Chic and versatile high-waist pants with a flattering flared cut. A modern wardrobe essential.',
    images: ['awaany_placeholders/products/4/black_1', 'awaany_placeholders/products/4/black_2', 'awaany_placeholders/products/4/beige_1'],
    colors: [
        { name: 'Black', hex: '#000000', uuid: "f4c7j0k1-1d5d-7d5h-1i6e-4e3h1e3d4ecg", images: ['awaany_placeholders/products/4/black_1', 'awaany_placeholders/products/4/black_2'] },
        { name: 'Beige', hex: '#F5F5DC', uuid: "e4d8k1l2-1d5d-7d5h-1i6e-4e3h1e3d4ecg", images: ['awaany_placeholders/products/4/beige_1'] }
    ],
    sizes: ['S', 'M', 'L'],
    specifications: { 'Waist Rise': 'High-Rise', 'Length': 'Regular', 'Fit': 'Flared Fit', 'Pleat Type': 'Pleated', 'Closure': 'Zip', 'Fly Type': 'Zip' },
    hsnCode: '6204',
  },
  {
    id: 5,
    uuid: "h5i9f9j2-2e6e-8e6i-2j7f-5f4i2f4e5fdh",
    name: 'Printed A-Line Skirt',
    category: 'skirts',
    price: 799,
    mrp: 1599,
    rating: 4.6,
    reviews: 120,
    description: 'A vibrant A-line skirt with a playful print. Easy to style and comfortable to wear all day long.',
    images: ['awaany_placeholders/products/5/yellow_1'],
    colors: [
        { name: 'Mustard Yellow', hex: '#FFDB58', uuid: "g5e9l2m3-2e6e-8e6i-2j7f-5f4i2f4e5fdh", images: ['awaany_placeholders/products/5/yellow_1', 'awaany_placeholders/products/5/yellow_2'] },
        { name: 'Navy Blue', hex: '#000080', uuid: "f5f0m3n4-2e6e-8e6i-2j7f-5f4i2f4e5fdh", images: ['awaany_placeholders/products/5/navy_1'] }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    specifications: { 'Shape': 'A-Line', 'Length': 'Midi', 'Waistband': 'Elasticated', 'Pattern': 'Printed', 'Knit or Woven': 'Woven' },
  },
  {
    id: 6,
    uuid: "i6j0g0k3-3f7f-9f7j-3k8g-6g5j3g5f6gei",
    name: 'Classic Linen Shirt Dress',
    category: 'western-dresses',
    price: 1599,
    mrp: 3299,
    rating: 4.7,
    reviews: 180,
    description: 'A timeless shirt dress made from pure linen. Effortlessly stylish and perfect for a casual day out or a semi-formal event.',
    images: ['awaany_placeholders/products/6/white_1', 'awaany_placeholders/products/6/white_2', 'awaany_placeholders/products/6/khaki_1'],
    colors: [
        { name: 'White', hex: '#FFFFFF', uuid: "h6g0n4o5-3f7f-9f7j-3k8g-6g5j3g5f6gei", images: ['awaany_placeholders/products/6/white_1', 'awaany_placeholders/products/6/white_2'] },
        { name: 'Khaki', hex: '#C3B091', uuid: "g6h1o5p6-3f7f-9f7j-3k8g-6g5j3g5f6gei", images: ['awaany_placeholders/products/6/khaki_1'] }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    specifications: { 'Sleeve Length': 'Long Sleeves', 'Shape': 'Shirt', 'Neck': 'Collared Neck', 'Length': 'Knee Length', 'Closure': 'Button' }
  },
  {
    id: 7,
    uuid: "j7k1h1l4-4g8g-0g8k-4l9h-7h6k4h6g7hfj",
    name: 'Embroidered Georgette Kurta',
    category: 'kurtas',
    price: 2199,
    mrp: 4499,
    rating: 4.9,
    reviews: 250,
    description: 'A stunning georgette kurta featuring delicate embroidery. Its flowy silhouette makes it a graceful choice for any celebration.',
    images: ['awaany_placeholders/products/7/peach_1'],
    colors: [
        { name: 'Peach', hex: '#FFDAB9', uuid: "i7h1p6q7-4g8g-0g8k-4l9h-7h6k4h6g7hfj", images: ['awaany_placeholders/products/7/peach_1'] },
        { name: 'Mint Green', hex: '#98FF98', uuid: "h7i2q7r8-4g8g-0g8k-4l9h-7h6k4h6g7hfj", images: ['awaany_placeholders/products/7/mint_1'] }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    specifications: { 'Sleeve Length': 'Full Sleeves', 'Shape': 'Anarkali', 'Neck': 'V-Neck', 'Ornamentation': 'Embroidery', 'Length': 'Floor Length', 'Hemline': 'Flared' },
  },
  {
    id: 8,
    uuid: "k8l2i2m5-5h9h-1h9l-5m0i-8i7l5i7h8igk",
    name: 'Kanjeevaram Silk Saree',
    category: 'sarees',
    price: 7999,
    mrp: 15999,
    rating: 5.0,
    reviews: 120,
    description: 'An authentic Kanjeevaram silk saree, handwoven with traditional motifs and a contrasting border. A true heirloom piece.',
    images: ['awaany_placeholders/products/8/green_1'],
    colors: [
        { name: 'Peacock Green', hex: '#008080', uuid: "j8i2r8s9-5h9h-1h9l-5m0i-8i7l5i7h8igk", images: ['awaany_placeholders/products/8/green_1'] },
        { name: 'Hot Pink', hex: '#FF69B4', uuid: "i8j3s9t0-5h9h-1h9l-5m0i-8i7l5i7h8igk", images: ['awaany_placeholders/products/8/pink_1'] }
    ],
    sizes: ['Free Size'],
    specifications: { 'Type': 'Kanjeevaram', 'Fabric': 'Pure Silk', 'Pattern': 'Woven Design', 'Border': 'Contrast Zari', 'Saree Length': '5.5 metres', 'Blouse': 'Unstitched Blouse Piece' },
  },
  {
    id: 9,
    uuid: "l9m3j3n6-6i0i-2i0m-6n1j-9j8m6j8i9ihl",
    name: 'Casual V-Neck Top',
    category: 'tops',
    price: 699,
    mrp: 1499,
    rating: 4.4,
    reviews: 88,
    description: 'A comfortable and stylish V-neck top for everyday wear.',
    images: ['awaany_placeholders/products/9/olive_1'],
    colors: [{ name: 'Olive Green', hex: '#808000', uuid: "k9j3t0u1-6i0i-2i0m-6n1j-9j8m6j8i9ihl", images: ['awaany_placeholders/products/9/olive_1'] }],
    sizes: ['S', 'M', 'L'],
    specifications: { 'Sleeve Length': 'Short Sleeves', 'Neck': 'V-Neck' },
  },
  {
    id: 10,
    uuid: "m0n4k4o7-7j1j-3j1n-7o2k-0k9n7k9j0ijm",
    name: 'Slim Fit Denim Jeans',
    category: 'jeans',
    price: 1499,
    mrp: 2999,
    rating: 4.6,
    reviews: 130,
    description: 'Classic slim fit jeans with a comfortable stretch.',
    images: ['awaany_placeholders/products/10/blue_1'],
    colors: [{ name: 'Dark Blue', hex: '#00008B', uuid: "l0k4u1v2-7j1j-3j1n-7o2k-0k9n7k9j0ijm", images: ['awaany_placeholders/products/10/blue_1'] }],
    sizes: ['28', '30', '32', '34'],
    specifications: { 'Fit': 'Slim Fit', 'Waist Rise': 'Mid-Rise' },
  },
  {
    id: 11,
    uuid: "n1o5l5p8-8k2k-4k2o-8p3l-1l0o8l0k1ikn",
    name: 'Silver Hoop Earrings',
    category: 'accessories',
    price: 499,
    mrp: 999,
    rating: 4.8,
    reviews: 200,
    description: 'Elegant silver hoop earrings to complete your look.',
    images: ['awaany_placeholders/products/11/silver_1'],
    colors: [{ name: 'Silver', hex: '#C0C0C0', uuid: "m1l5v2w3-8k2k-4k2o-8p3l-1l0o8l0k1ikn", images: ['awaany_placeholders/products/11/silver_1'] }],
    sizes: ['One Size'],
    specifications: { 'Material': 'Sterling Silver', 'Type': 'Hoop' },
  },
  {
    id: 12,
    uuid: "o2p6m6q9-9l3l-5l3p-9q4m-2m1p9m1l2ilo",
    name: 'Canvas Tote Bag',
    category: 'handbags',
    price: 899,
    mrp: 1799,
    rating: 4.7,
    reviews: 95,
    description: 'A spacious and durable canvas tote bag for your daily essentials.',
    images: ['awaany_placeholders/products/12/natural_1'],
    colors: [{ name: 'Natural', hex: '#F5F5DC', uuid: "n2m6w3x4-9l3l-5l3p-9q4m-2m1p9m1l2ilo", images: ['awaany_placeholders/products/12/natural_1'] }],
    sizes: ['One Size'],
    specifications: { 'Material': 'Canvas', 'Compartment Closure': 'Zip' },
  },
  {
    id: 13,
    uuid: "p3q7n7r0-0m4m-6m4q-0r5n-3n2q0n2m3imp",
    name: 'Leather Ankle Boots',
    category: 'footwear',
    price: 2499,
    mrp: 4999,
    rating: 4.5,
    reviews: 110,
    description: 'Stylish leather ankle boots with a comfortable block heel.',
    images: ['awaany_placeholders/products/13/tan_1'],
    colors: [{ name: 'Tan', hex: '#D2B48C', uuid: "o3n7x4y5-0m4m-6m4q-0r5n-3n2q0n2m3imp", images: ['awaany_placeholders/products/13/tan_1'] }],
    sizes: ['6', '7', '8', '9'],
    specifications: { 'Type': 'Ankle Boots', 'Heel Type': 'Block' },
  },
  {
    id: 14,
    uuid: "q4r8o8s1-1n5n-7n5r-1s6o-4o3r1o3n4inq",
    name: 'Classic Tailored Blazer',
    category: 'blazers',
    price: 2999,
    mrp: 5999,
    rating: 4.7,
    reviews: 80,
    description: 'A sharp, tailored blazer that adds instant polish to any outfit.',
    images: ['awaany_placeholders/products/14/navy_1'],
    colors: [{ name: 'Navy', hex: '#000080', uuid: "p4o8y5z6-1n5n-7n5r-1s6o-4o3r1o3n4inq", images: ['awaany_placeholders/products/14/navy_1'] }],
    sizes: ['S', 'M', 'L'],
    specifications: { 'Fit': 'Regular Fit', 'Sleeve Length': 'Long Sleeves' },
  },
  {
    id: 15,
    uuid: "r5s9p9t2-2o6o-8o6s-2t7p-5p4s2p4o5ior",
    name: 'Utility Jumpsuit',
    category: 'jumpsuits',
    price: 2199,
    mrp: 4299,
    rating: 4.6,
    reviews: 65,
    description: 'A comfortable and chic utility jumpsuit for a modern look.',
    images: ['awaany_placeholders/products/15/olive_1'],
    colors: [{ name: 'Olive', hex: '#808000', uuid: "q5p9z6a7-2o6o-8o6s-2t7p-5p4s2p4o5ior", images: ['awaany_placeholders/products/15/olive_1'] }],
    sizes: ['S', 'M', 'L', 'XL'],
    specifications: { 'Type': 'Utility', 'Sleeve Length': 'Short Sleeves' },
  }
];

export const REVIEWS: Omit<Review, 'date' | 'status'>[] = [
    { id: 1, productId: 1, userId: 'a1b2c3d4-e5f6-4a5b-8c9d-0f1e2d3c4b5a', author: 'Priya S.', rating: 5, comment: "The dress is absolutely gorgeous! The fabric is soft and the fit is perfect. Received so many compliments.", userImage: 'awaany_placeholders/users/user_1', productImages: ['awaany_placeholders/products/1/pink_1', 'awaany_placeholders/products/1/pink_2']},
    { id: 2, productId: 2, userId: 'b1c2d3e4-f5g6-4b5c-8d9e-0g1f2e3d4c5b', author: 'Anjali M.', rating: 4, comment: "Beautiful kurta, the chikankari work is very neat. The color is slightly different from the picture but still lovely.", userImage: 'awaany_placeholders/users/user_2', productImages: []},
    { id: 3, productId: 3, userId: 'c1d2e3f4-g5h6-4c5d-8e9f-0h1g2f3e4d5c', author: 'Rina K.', rating: 5, comment: "This saree is a showstopper! The quality is top-notch and it looks even more beautiful in person.", userImage: 'awaany_placeholders/users/user_3', productImages: ['awaany_placeholders/products/3/blue_1']},
];

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