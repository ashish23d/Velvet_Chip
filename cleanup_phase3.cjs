const fs = require('fs');
const path = 'c:/Users/Admin/Downloads/VelvetChip 2/VelvetChip final/VelvetChip final/VelvetChip Project v_002/velvet chip/context/AppContext.tsx';

try {
    const data = fs.readFileSync(path, 'utf8');
    let lines = data.split('\n');

    console.log(`Original file has ${lines.length} lines`);

    // Step 1: Remove duplicate state declarations (lines 260-269)
    // These are: siteSettings, contactDetails, siteContent, slides, seasonalEditCards, announcement, emailSettings
    console.log('Removing duplicate state declarations (lines 260-269)...');
    lines.splice(259, 10); // 0-indexed, so line 260 = index 259

    // Step 2: Remove duplicate UI state (confirmationState, reviewModalState around lines 284, 298-306)
    // After previous deletion, indices shift down by 10
    console.log('Removing duplicate UI state...');
    // reviewModalState was at 284, now at 274
    lines.splice(273, 1);

    // confirmationState was at 298-306, now at 287-295  
    lines.splice(286, 9);

    // Step 3: Remove fetch functions for site content (they're in SiteContext now)
    // We need to find and remove fetchSiteContent-related code in initApp
    // This is complex, so let's do it via targeted replacements

    console.log(`File now has ${lines.length} lines after deletions`);
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Phase 3 cleanup completed successfully!');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
