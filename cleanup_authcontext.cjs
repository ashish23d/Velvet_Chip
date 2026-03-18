const fs = require('fs');
const path = 'c:/Users/Admin/Downloads/VelvetChip 2/VelvetChip final/VelvetChip final/VelvetChip Project v_002/velvet chip/context/AuthContext.tsx';

try {
    if (!fs.existsSync(path)) {
        console.error('File not found:', path);
        process.exit(1);
    }
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split('\n');

    // Range to delete (1-based, inclusive): 32 to 53
    const start = 32;
    const end = 53;

    let newLines = [...lines];

    // Adjust for 0-based index
    const startIndex = start - 1;
    const count = end - start + 1;

    console.log(`Deleting lines ${start} to ${end} (${count} lines)`);
    console.log(`First deleted: ${newLines[startIndex].trim()}`);
    console.log(`Last deleted: ${newLines[startIndex + count - 1].trim()}`);

    newLines.splice(startIndex, count);

    fs.writeFileSync(path, newLines.join('\n'));
    console.log('File updated successfully.');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
