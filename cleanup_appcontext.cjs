const fs = require('fs');
const path = 'c:/Users/Admin/Downloads/VelvetChip 2/VelvetChip final/VelvetChip final/VelvetChip Project v_002/velvet chip/context/AppContext.tsx';

try {
    if (!fs.existsSync(path)) {
        console.error('File not found:', path);
        process.exit(1);
    }
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split('\n');

    // Ranges to delete (1-based, inclusive), sorted descending
    const ranges = [
        [1660, 1909],
        [965, 1009],
        [482, 618]
    ];

    let newLines = [...lines];

    // Check if line count is sufficient
    if (lines.length < 1909) {
        console.warn('File has fewer lines than expected range. Adjusting max range.');
        // We proceed but careful.
    }

    for (const [start, end] of ranges) {
        // Adjust for 0-based index
        const startIndex = start - 1;
        const count = end - start + 1;

        console.log(`Deleting lines ${start} to ${end} (${count} lines)`);

        // Safety check
        if (startIndex < newLines.length) {
            console.log(`First deleted line: ${newLines[startIndex].trim()}`);
            if (startIndex + count - 1 < newLines.length) {
                console.log(`Last deleted line: ${newLines[startIndex + count - 1].trim()}`);
            }
            newLines.splice(startIndex, count);
        } else {
            console.error('Start index out of bounds:', startIndex);
        }
    }

    fs.writeFileSync(path, newLines.join('\n'));
    console.log('File updated successfully.');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
