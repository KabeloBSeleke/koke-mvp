// Generate responsive WebP images from originals in src/img/ (run: npm run images).
// Output: assets/img/<name>-800.webp and <name>-1600.webp (capped at the original width),
// plus assets/og-image.jpg (1200x630) from src/og-image.png.
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'src/img';
const OUT = 'assets/img';
const WIDTHS = [800, 1600];

await mkdir(OUT, { recursive: true });
for (const file of (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const name = path.parse(file).name;
  const { width } = await sharp(path.join(SRC, file)).metadata();
  for (const w of WIDTHS) {
    await sharp(path.join(SRC, file))
      .resize({ width: Math.min(w, width) })
      .webp({ quality: 72 })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
  }
}
await sharp('src/og-image.png').resize(1200, 630).jpeg({ quality: 82, mozjpeg: true }).toFile('assets/og-image.jpg');
console.log('images: done');
