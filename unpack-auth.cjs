const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.env.HOME || '/root', '.local/share/opencode');
fs.mkdirSync(targetDir, { recursive: true });

const bundlePath = path.join(__dirname, 'auth.bundle.txt');
if (fs.existsSync(bundlePath)) {
  const content = fs.readFileSync(bundlePath, 'utf8').replace(/\s+/g, '');
  const decoded = Buffer.from(content, 'base64').toString('utf8');
  const targetFile = path.join(targetDir, 'auth.json');
  fs.writeFileSync(targetFile, decoded, { mode: 0o600 });
  console.log(`[Unpack] Successfully wrote auth.json (${decoded.length} chars)`);
} else {
  console.log('[Unpack] No auth.bundle.txt found');
}
