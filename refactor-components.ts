import { Project } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
});

const groups = {
    layout: ["Header.tsx", "Footer.tsx", "BottomNavigation.tsx", "MobileMenu.tsx", "Breadcrumb.tsx", "AnnouncementBar.tsx"],
    product: ["ProductCard.tsx", "ReviewCard.tsx", "ReviewFormModal.tsx", "ReviewsList.tsx", "SimilarProductCard.tsx", "SimilarProductsModal.tsx", "SpecialProductCard.tsx", "StarRatingInput.tsx", "OrderProductCard.tsx", "Rating.tsx"],
    profile: ["ProfileCompletion.tsx", "ProfileInformation.tsx", "ProfileSidebar.tsx", "MyAddresses.tsx", "MyCoupons.tsx", "MyOrders.tsx", "MyReturns.tsx", "MySavedItems.tsx", "MyWishlist.tsx", "Avatar.tsx"],
    cart: ["CartHeader.tsx", "CartItem.tsx", "FlyToCartAnimation.tsx"],
    checkout: ["CheckoutStepper.tsx", "OrderSummary.tsx", "PaymentProcessingAnimation.tsx", "PaymentSuccessAnimation.tsx", "AddressSelectionModal.tsx", "AddressForm.tsx", "ShippingLabel.tsx", "AddressCard.tsx", "InvoiceTemplate.tsx"],
    order: ["OrderCard.tsx", "OrderItem.tsx", "OrderTracker.tsx", "RecentOrderItem.tsx"],
    search: ["SearchBar.tsx", "MobileSearchOverlay.tsx", "FilterSidebar.tsx", "MobileFilterSortSheet.tsx"],
    home: ["CategoryShowcase.tsx", "HeroSlider.tsx", "NewArrivalCard.tsx", "SeasonalCard.tsx", "CardRenderer.tsx"],
    shared: ["CloudinaryImage.tsx", "ConfirmationModal.tsx", "CouponCard.tsx", "HelpCenter.tsx", "HelpModal.tsx", "OfferModal.tsx", "Pagination.tsx", "ProtectedRoute.tsx", "ScrollToTop.tsx", "SignUpPopup.tsx", "SupabaseImage.tsx", "SupabaseMedia.tsx", "ThankYouModal.tsx", "EditableWrapper.tsx"],
    media: ["CustomerPhotos.tsx", "CustomerVideos.tsx"]
};

async function run() {
    const componentsDir = path.join(process.cwd(), "components");

    for (const [folder, files] of Object.entries(groups)) {
        const destDir = path.join(componentsDir, folder);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        for (const file of files) {
            const oldPath = path.join(componentsDir, file);
            if (!fs.existsSync(oldPath)) {
                console.log(`Skipping \${file}, not found.`);
                continue;
            }

            const newPath = path.join(destDir, file);

            const sourceFile = project.getSourceFile(oldPath);
            if (sourceFile) {
                console.log(`Moving \${file} to \${folder}/...`);
                sourceFile.moveToDirectory(destDir);
            } else {
                console.log(`Warning: \${file} not loaded in TS Project.`);
            }
        }
    }

    console.log("Saving project...");
    await project.save();
    console.log("Done.");
}

run().catch(console.error);
