/**
 * Makes black background transparent in the BYOB logo.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const LOGO_PATH = path.join(__dirname, '..', 'public', 'byob-logo.png');
const TMP_PATH = path.join(__dirname, '..', 'public', 'byob-logo-tmp.png');
const LUMINANCE_THRESHOLD = 0.55;

function isDarkGrayOrBlack(r, g, b) {
  const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
  const saturation = maxC === 0 ? 0 : (maxC - minC) / maxC;
  return luminance < LUMINANCE_THRESHOLD && saturation < 0.45;
}

async function makeBlackTransparent(inputPath, outputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (isDarkGrayOrBlack(r, g, b)) {
      data[i + 3] = 0;
    }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(outputPath);
}

async function main() {
  await makeBlackTransparent(LOGO_PATH, TMP_PATH);
  fs.renameSync(TMP_PATH, LOGO_PATH);
  console.log('Logo processed: black background made transparent.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
