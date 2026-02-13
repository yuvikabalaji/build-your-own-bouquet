/**
 * Copies images from Cursor assets to public/assets and converts black backgrounds to transparent.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.resolve(
  process.env.USERPROFILE || process.env.HOME,
  '.cursor', 'projects', 'c-Cursor-Projects-BYOB', 'assets'
);
const PREFIX = 'c__Users_yuvik_AppData_Roaming_Cursor_User_workspaceStorage_63af905f2bde7a35d72737431622898f_images_';

const FLOWERS = [
  { src: 'tulip-371d92d5-bc3d-47c7-87b5-30b914c6ba5c.png', out: 'tulip.png' },
  { src: 'rose-d41b6737-f458-4dbe-8580-c9024b79b6c6.png', out: 'rose.png' },
  { src: 'sunflower-2c145ad5-da6e-4bd2-bc5b-b92887040c47.png', out: 'sunflower.png' },
  { src: 'orchid-3d9f78f6-cc82-4bcb-ab1d-731f00626143.png', out: 'orchid.png' },
  { src: 'hydrangea-bef2f56b-aad7-4fa3-b175-2c8a5e5b0dd4.png', out: 'hydrangea.png' },
  { src: 'peony-7ca4dd1c-e03e-42bf-956a-f2822dec9080.png', out: 'peony.png' },
  { src: 'lily-8b9e9386-bae6-47b9-b18a-374f7924052e.png', out: 'lily.png' },
];

const PROPS = [
  { src: 'teddy-2e3da6ca-c745-415f-9025-e3698659921e.png', out: 'teddy-bear.png' },
  { src: 'heart-1a163e58-a95b-4248-8127-d61767336fa7.png', out: 'red-heart.png' },
  { src: 'strawberries-ce399edd-13ea-4d20-b7e6-d0ec68e6e737.png', out: 'strawberry.png' },
  { src: 'marshmallow-407795d4-168c-430a-959e-db269c9dc4a8.png', out: 'marshmallow.png' },
];

const BLACK_THRESHOLD = 45;

async function makeBlackTransparent(inputPath, outputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD) {
      data[i + 3] = 0;
    }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(outputPath);
}

async function processItem(item, outDir) {
  const srcPath = path.join(ASSETS_DIR, PREFIX + item.src);
  const outPath = path.join(outDir, item.out);

  if (!fs.existsSync(srcPath)) {
    console.warn(`  Skip ${item.out}: source not found`);
    return;
  }
  await makeBlackTransparent(srcPath, outPath);
  console.log(`  OK ${item.out}`);
}

async function main() {
  const projectRoot = path.join(__dirname, '..');
  const flowersDir = path.join(projectRoot, 'public', 'assets', 'flowers');
  const propsDir = path.join(projectRoot, 'public', 'assets', 'props');

  [flowersDir, propsDir].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  console.log('Assets path:', ASSETS_DIR);
  console.log('Processing flowers...');
  for (const item of FLOWERS) {
    await processItem(item, flowersDir);
  }
  console.log('Processing props...');
  for (const item of PROPS) {
    await processItem(item, propsDir);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
