const sharp = require('sharp');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_PATH = path.join(PROJECT_ROOT, 'assets', 'images', 'icon.png');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'icons');

// φτιάχνει τα δύο PNG icons που χρειάζεται το public/manifest.json (PWA), από το ίδιο
// 1024x1024 source icon που χρησιμοποιεί ήδη η εφαρμογή για iOS/Android (assets/images/icon.png)
async function main() {
  await sharp(SRC_PATH).resize(192, 192).png().toFile(path.join(OUT_DIR, 'icon-192.png'));
  await sharp(SRC_PATH).resize(512, 512).png().toFile(path.join(OUT_DIR, 'icon-512.png'));
  console.log('Done. Wrote icon-192.png and icon-512.png to public/icons/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
