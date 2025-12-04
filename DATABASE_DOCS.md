

# Awaany Supabase Architecture Documentation

This document provides a detailed overview of the Supabase backend structure, including database tables and storage bucket utilization. All tables are located within the `public` schema of the Supabase database.

---

## Supabase Storage Buckets

The application utilizes several Supabase Storage buckets to manage media assets. All buckets are configured for public access.

### `products`

-   **Description**: Stores all images related to products. This includes main product images and images specific to different color variants.
-   **Path Format**: `prod_[product_id]/[color_name]/[timestamp].[ext]` or legacy `awaany_placeholders/products/...`
-   **Linked Tables**: `products`

### `categories`

-   **Description**: Stores images used for category showcase cards on the homepage and the hero banners that appear at the top of category-specific pages.
-   **Path Format**: `[category_id]/[image_name].[ext]` or legacy `awaany_placeholders/categories/...`
-   **Linked Tables**: `categories`

### `site-assets`

-   **Description**: A general-purpose bucket for all other site-wide media. This includes logos, promotional banners (`seasonal_edit_cards`), generated invoice PDFs, QR codes, and various placeholder images used throughout the application.
-   **Path Format**: Varies by asset type, e.g., `logo/[timestamp].[ext]`, `invoices/pdf/[invoice_number].pdf`, `seasonal_cards/[card_id]/...`
-   **Linked Tables**: `site_content`, `slides`, `seasonal_edit_cards`, `invoices`

### `avatars`

-   **Description**: Stores user-uploaded profile pictures (avatars).
-   **Path Format**: `[user_id]/[timestamp].[ext]` or legacy `awaany_placeholders/users/...`
-   **Linked Tables**: `profiles`

### `review-images`

-   **Description**: Stores images uploaded by customers as part of their product reviews or return requests. The path structure separates these two use cases.
-   **Path Format**: `user_[user_id]/prod_[product_id]/[timestamp].[ext]` for reviews, and `returns/[order_id]/[timestamp].[ext]` for returns.
-   **Linked Tables**: `reviews`, `returns`

### `app-assets`

-   **Description**: Stores media specifically optimized for the mobile application, such as transparent PNGs for category icons.
-   **Path Format**: `[category_name]/app-icon/[timestamp].[ext]`
-   **Linked Tables**: `categories` (via `app_image_path` column)

---

## Database Tables

Below is a detailed summary of each table, its purpose, and its key columns.

### `products`

-   **Description**: The core table for all product information, including pricing, descriptions, and variant details.
-   **Key Columns**:
    -   `id` (serial, PK): Unique identifier for the product.
    -   `uuid` (uuid): A universally unique identifier.
    -   `name` (text): The display name of the product.
    -   `category` (text, FK -> `categories.id`): Links the product to a category.
    -   `price` (numeric): The final selling price.
    -   `mrp` (numeric): The Maximum Retail Price (original price).
    -   `images` (text[]): An array of paths to main product images in the **`products`** bucket.
    -   `colors` (jsonb): Stores an array of color variant objects, e.g., `[{ "name": "Sky Blue", "hex": "#A5C0DD", "images": ["path1", "path2"] }]`. The `images` array contains paths to the **`products`** bucket.
    -   `sizes` (text[]): An array of available sizes for the product (e.g., `["S", "M", "L"]`).
-   **RLS**: Enabled for public read access. Write access is restricted.

### `categories`

-   **Description**: Stores information about product categories.
-   **Key Columns**:
    -   `id` (text, PK): A unique, human-readable identifier (e.g., "sarees").
    -   `name` (text): The display name of the category (e.g., "Sarees").
    -   `hero_image` (text): Path to an image in the **`categories`** bucket for showcase cards.
    -   `page_hero_media` (jsonb): Array of media objects `[{ "path": "...", "type": "image" | "video" }]` pointing to the **`categories`** bucket for the category page banner.
    -   `app_image_path` (text): Path to a transparent PNG in the **`app-assets`** bucket.

### `profiles`

-   **Description**: Stores user profile information, extending Supabase's built-in `auth.users` table.
-   **Key Columns**:
    -   `id` (uuid, PK, FK -> `auth.users.id`): Links directly to an authenticated user.
    -   `name` (text): The user's full name.
    -   `email` (text): The user's email address.
    -   `avatar` (text): Path to the user's avatar image in the **`avatars`** bucket.
    -   `cart` (jsonb): Stores an array of `CartItem` objects representing the user's current shopping cart.
    -   `wishlist` (jsonb): Stores an array of `Product` objects that the user has added to their wishlist.
-   **RLS**: Enabled. Users can only read and write their own profile data.

### `search_history`

-   **Description**: Stores the last 10 search queries for each user. Used to display "Recent Searches" in the search bar.
-   **Key Columns**:
    -   `id` (uuid, PK): Unique identifier.
    -   `user_id` (uuid, FK -> `auth.users.id`): The user who performed the search.
    -   `query` (text): The search text.
    -   `created_at` (timestamptz): Timestamp.
-   **Notes**: History older than 15 days is filtered out by the application logic.

### `reviews`

-   **Description**: Contains customer reviews for products, which are subject to admin moderation.
-   **Key Columns**:
    -   `id` (serial, PK): Unique identifier for the review.
    -   `product_id` (int8, FK -> `products.id`): The product being reviewed.
    -   `user_id` (uuid, FK -> `profiles.id`): The user who wrote the review.
    -   `rating` (int8): The star rating from 1 to 5.
    -   `comment` (text): The text content of the review.
    -   `status` (text): Moderation status ('pending', 'approved', 'rejected').
    -   `product_images` (text[]): Array of paths to images uploaded by the user, stored in the **`review-images`** bucket.

### `orders`

-   **Description**: Stores all order details, linking users, products, addresses, and payments.
-   **Key Columns**:
    -   `id` (uuid, PK): The unique order identifier.
    -   `user_id` (uuid, FK -> `profiles.id`): The user who placed the order.
    -   `order_date` (timestamptz): Timestamp of when the order was placed.
    -   `current_status` (text): The current delivery status (e.g., 'Processing', 'Shipped').
    -   `items` (jsonb): An array of `CartItem` objects representing the products in the order.
    -   `shipping_address` (jsonb): A snapshot of the `Address` object used for this order.
    -   `payment` (jsonb): An object containing payment details like method and status.
    -   `downloadable_invoice_url` (text): Path to the generated invoice PDF in the **`site-assets`** bucket.
    -   `courier_name` (text): Name of the shipping partner (e.g., 'FedEx', 'Delhivery').
    -   `tracking_id` (text): The Tracking ID or AWB number.
    -   `tracking_url` (text): Direct link to the courier's tracking page.
-   **RLS**: Enabled. Users can only access their own orders.

### `invoices`

-   **Description**: Stores generated invoice data and links to the PDF and QR code files. Created by an Edge Function.
-   **Key Columns**:
    -   `id` (uuid, PK): Unique invoice identifier.
    -   `order_id` (uuid, FK -> `orders.id`): The associated order.
    -   `invoice_number` (text): The generated invoice number (e.g., "INV-2024-ABC123").
    -   `pdf_url` (text): Path to the generated PDF file in the **`site-assets`** bucket.
    -   `qr_code_url` (text): Path to the generated QR code image in the **`site-assets`** bucket.

### `returns`

-   **Description**: Manages customer return requests for items from an order.
-   **Key Columns**:
    -   `id` (uuid, PK): Unique return request identifier.
    -   `order_id` (uuid, FK -> `orders.id`): The original order containing the item.
    -   `user_id` (uuid, FK -> `profiles.id`): The user requesting the return.
    -   `item_id` (text): The specific ID of the `CartItem` from the order's `items` JSONB.
    -   `status` (text): The current status of the return process (e.g., 'Pending', 'Approved').
    -   `images` (jsonb): Array of paths to images uploaded by the customer, stored in the **`review-images`** bucket.

### `site_content`

-   **Description**: A key-value table for various site-wide content snippets and settings, allowing admins to update text and configurations without code changes.
-   **Key Columns**:
    -   `id` (text, PK): The unique key for the content (e.g., 'footer_description', 'site_settings').
    -   `data` (jsonb): A flexible JSON object containing the content or settings for that key. Can include text, URLs, and paths to the **`site-assets`** bucket.

### `slides`

-   **Description**: Manages the content for the homepage hero slider.
-   **Key Columns**:
    -   `id` (uuid, PK): Unique slide identifier.
    -   `media` (jsonb): Array of media objects (`{ "path": "...", "type": "image" | "video" }`) pointing to the **`site-assets`** bucket.
    -   `text` (text): The caption text displayed on the slide.
    -   `ordering` (int8): Determines the order of the slides.

### `seasonal_edit_cards`

-   **Description**: Manages the promotional cards in the "Seasonal Edit" section on the homepage.
-   **Key Columns**:
    -   `id` (uuid, PK): Unique card identifier.
    -   `card_type` (text): Either 'product' (links to a product) or 'custom' (fully custom content).
    -   `product_id` (int8, FK -> `products.id`): If `card_type` is 'product', this links to the featured product.
    -   `image_path` (text): If `card_type` is 'custom', this path points to an image in the **`site-assets`** bucket.

### Other Tables

-   **`addresses`**: Stores shipping addresses associated with user profiles.
-   **`contacts`**: Stores messages submitted through the contact form.
-   **`promotions`**: Manages discount codes and promotional offers.
-   **`mail_templates`**: Stores HTML templates for transactional and promotional emails.
-   **`subscribers`**: A simple table to store the email addresses of newsletter subscribers.
-   **`pending_changes`**: A generic table for changes that require admin approval (currently a placeholder, not in active use).

---

## Troubleshooting & Setup: Fixing "new row violates row-level security policy"

If you encounter an error when uploading to the `app-assets` bucket, it is because the bucket policies are not set. Run the following SQL in your Supabase SQL Editor:

```sql
-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-assets', 'app-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow Public Read Access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'app-assets' );

-- 3. Allow Authenticated Users to Upload
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'app-assets' AND auth.role() = 'authenticated' );

-- 4. Allow Authenticated Users to Update
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'app-assets' AND auth.role() = 'authenticated' );

-- 5. Allow Authenticated Users to Delete
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'app-assets' AND auth.role() = 'authenticated' );
```