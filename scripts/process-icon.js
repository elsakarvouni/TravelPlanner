const sharp = require('sharp');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_PATH = path.join(PROJECT_ROOT, 'assets', 'images', 'logo-source.png');
const OUT_DIR = path.join(PROJECT_ROOT, 'assets', 'images');

async function main() {
  const image = sharp(SRC_PATH);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  console.log('loaded', width, height, channels);

  const isBackground = new Uint8Array(width * height); // 1 = background (checkerboard) to remove

  function idx(x, y) {
    return y * width + x;
  }
  function isGrayish(r, g, b) {
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    return maxC - minC < 12 && r > 170; // pale grayscale tones only (checkerboard range)
  }

  const queue = [];
  function tryEnqueue(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const i = idx(x, y);
    if (isBackground[i]) return;
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    if (isGrayish(r, g, b)) {
      isBackground[i] = 1;
      queue.push([x, y]);
    }
  }

  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const [x, y] = queue[head++];
    tryEnqueue(x + 1, y);
    tryEnqueue(x - 1, y);
    tryEnqueue(x, y + 1);
    tryEnqueue(x, y - 1);
  }

  console.log('background pixels found:', queue.length, 'of', width * height);

  const sampleX = Math.round(width * 0.5);
  const sampleY = Math.round(height * 0.21);
  const sO = idx(sampleX, sampleY) * channels;
  const fillR = data[sO];
  const fillG = data[sO + 1];
  const fillB = data[sO + 2];
  console.log('fill color sampled at', sampleX, sampleY, '=', fillR, fillG, fillB);

  const outBuffer = Buffer.from(data);
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y);
      const o = i * channels;
      if (isBackground[i]) {
        outBuffer[o] = fillR;
        outBuffer[o + 1] = fillG;
        outBuffer[o + 2] = fillB;
      } else {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log('content bounding box:', { minX, minY, maxX, maxY });

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const size = Math.max(cropW, cropH);
  const padLeft = Math.floor((size - cropW) / 2);
  const padTop = Math.floor((size - cropH) / 2);

  const croppedBuf = await sharp(outBuffer, { raw: { width, height, channels } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toBuffer();

  const squared = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: fillR, g: fillG, b: fillB },
    },
  })
    .composite([{ input: croppedBuf, left: padLeft, top: padTop }])
    .png()
    .toBuffer();

  const bg = { r: fillR, g: fillG, b: fillB };

  await sharp(squared).resize(1024, 1024).flatten({ background: bg }).removeAlpha().png().toFile(path.join(OUT_DIR, 'icon.png'));
  await sharp(squared).resize(1024, 1024).flatten({ background: bg }).removeAlpha().png().toFile(path.join(OUT_DIR, 'android-icon-foreground.png'));
  await sharp({
    create: { width: 1024, height: 1024, channels: 3, background: bg },
  })
    .flatten({ background: bg })
    .removeAlpha()
    .png()
    .toFile(path.join(OUT_DIR, 'android-icon-background.png'));
  await sharp(squared).resize(1024, 1024).greyscale().flatten({ background: bg }).removeAlpha().png().toFile(path.join(OUT_DIR, 'android-icon-monochrome.png'));
  await sharp(squared).resize(400, 400).flatten({ background: bg }).removeAlpha().png().toFile(path.join(OUT_DIR, 'splash-icon.png'));
  await sharp(squared).resize(48, 48).flatten({ background: bg }).removeAlpha().png().toFile(path.join(OUT_DIR, 'favicon.png'));

  console.log(
    'Done. Fill color used:',
    `rgb(${fillR},${fillG},${fillB})`,
    '=',
    `#${[fillR, fillG, fillB].map((c) => c.toString(16).padStart(2, '0')).join('')}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
