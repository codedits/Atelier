const fs = require('fs');
const path = require('path');

function searchMojibake(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'public' || file.endsWith('.png') || file.endsWith('.jpg') || file === '.brain') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchMojibake(fullPath);
        } else {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('\uFFFD') || content.includes('ï¿½') || content.includes('Ã') || content.includes('Â') || content.includes('â')) {
                console.log(`Found in: ${fullPath}`);
                if (content.includes('\uFFFD')) console.log('  -> Contains U+FFFD ()');
                if (content.includes('ï¿½')) console.log('  -> Contains ï¿½');
                if (content.includes('Ã')) console.log('  -> Contains Ã');
                if (content.includes('Â')) console.log('  -> Contains Â');
                if (content.includes('â')) console.log('  -> Contains â');
            }
        }
    }
}

searchMojibake('d:\\atelier\\Atelier');
