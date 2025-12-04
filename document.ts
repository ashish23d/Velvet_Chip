/**
 * ==========================================
 * Awaany Supabase Architecture Documentation
 * ==========================================
 *
 * This document provides an overview of the Supabase backend structure,
 * including database tables and storage bucket utilization.
 *
 * All tables are located within the `public` schema of the Supabase database.
 */

// ==========================================
// Supabase Storage Buckets
// ==========================================
// The application utilizes several Supabase Storage buckets to manage media assets.
// All buckets are configured for public access.

/**
 * @bucket products
 * @description Stores all images related to products, including main images and color-specific variant images.
 * @path_format `prod_[product_id]/[color_name]/[timestamp].[ext]` or legacy `awaany_placeholders/products/...`
 * @linked_tables `products`
 */

/**
 * @bucket categories
 * @description Stores images used for category showcases and hero banners on category-specific pages.
 * @path_format `[category_id]/[image_name].[ext]` or legacy `awaany_placeholders/categories/...`
 * @linked_tables `categories`
 */

/**
 * @bucket site-assets
 * @description A general-purpose bucket for all other site-wide media. This includes logos, promotional banners, invoice PDFs, QR codes, and placeholder images.
 * @path_format Varies by asset type, e.g., `logo/[timestamp].[ext]`, `invoices/pdf/[invoice_number].pdf`, `awaany_placeholders/...`
 * @linked_tables `site_content`, `slides`, `seasonal_edit_cards`, `invoices`
 */

/**
 * @bucket avatars
 * @description Stores user profile pictures.
 * @path_format `[user_id]/[timestamp].[ext]` or legacy `awaany_placeholders/users/...`
 * @linked_tables `profiles`
 */

/**
 * @bucket review-images
 * @description Stores images uploaded by customers as part of their product reviews or return requests.
 * @path_format `user_[user_id]/prod_[product_id]/[timestamp].[ext]` for reviews, `returns/[order_id]/...` for returns.
 * @linked_tables `reviews`, `returns`
 */


// ==========================================
// Database Tables
// ==========================================
// Below is a summary of each table and its connection to the storage buckets.

/**
 * @table products
 * @description Core table for all product information.
 * @storage_links
 *  - `images` (string[]): Array of paths to images stored in the `products` bucket.
 *  - `colors` (JSONB): Contains an array of color objects, each of which can have an `images` array with paths to the `products` bucket.
 */

/**
 * @table categories
 * @description Stores information about product categories.
 * @storage_links
 *  - `hero_image` (string): Path to an image in the `categories` bucket, used for showcase cards.
 *  - `page_hero_media` (JSONB): Array of media objects (`{path, type}`), with paths pointing to the `categories` bucket. Used for the category page banner.
 */

/**
 * @table profiles
 * @description Stores user profile information, extending the `auth.users` table.
 * @storage_links
 *  - `avatar` (string): Path to the user's avatar image in the `avatars` bucket.
 * @notes Contains JSONB columns for `cart`, `wishlist`, `saved_items`, and `notifications`.
 */

/**
 * @table reviews
 * @description Contains customer reviews for products.
 * @storage_links
 *  - `user_image` (string): Path to the reviewer's avatar in the `avatars` bucket.
 *  - `product_images` (string[]): Array of paths to images uploaded by the user, stored in the `review-images` bucket.
 */

/**
 * @table orders
 * @description Stores all order details. It's a central table linking users, products, and payments.
 * @storage_links None directly, but related tables like `invoices` have storage links.
 * @notes Contains JSONB columns for `items`, `shipping_address`, `payment`, and `status_history`.
 */

/**
 * @table invoices
 * @description Stores generated invoice data and links to the PDF and QR code files.
 * @storage_links
 *  - `pdf_url` (string): Path to the generated PDF file in the `site-assets` bucket.
 *  - `qr_code_url` (string): Path to the generated QR code image in the `site-assets` bucket.
 */

/**
 * @table returns
 * @description Manages customer return requests for items from an order.
 * @storage_links
 *  - `images` (JSONB): Array of paths to images uploaded by the customer for the return request, stored in the `review-images` bucket.
 */

/**
 * @table site_content
 * @description A key-value store for various site-wide content and settings.
 * @storage_links
 *  - The `data` (JSONB) column can contain image paths pointing to the `site-assets` bucket. Examples include the site logo (`site_settings`), about page image (`home_about_section`), etc.
 */

/**
 * @table slides
 * @description Manages the slides for the homepage hero banner.
 * @storage_links
 *  - `media` (JSONB): Array of media objects (`{path, type}`), with paths pointing to the `site-assets` bucket.
 */

/**
 * @table seasonal_edit_cards
 * @description Manages the promotional cards in the "Seasonal Edit" section on the homepage.
 * @storage_links
 *  - `image_path` (string): If the card type is 'custom', this path points to an image in the `site-assets` bucket. If the type is 'product', the image is sourced from the `products` table.
 */

/**
 * @table addresses
 * @description Stores shipping addresses associated with user profiles.
 * @storage_links None.
 */

/**
 * @table contacts
 * @description Stores messages submitted through the contact form.
 * @storage_links None.
 */

/**
 * @table promotions
 * @description Manages discount codes and promotional offers.
 * @storage_links None.
 */

/**
 * @table mail_templates
 * @description Stores HTML templates for transactional and promotional emails.
 * @storage_links None.
 */

/**
 * @table subscribers
 * @description A simple table to store the email addresses of newsletter subscribers.
 * @storage_links None.
 */

/**
 * @table pending_changes
 * @description A generic table for changes that require admin approval (currently a placeholder).
 * @storage_links None.
 */