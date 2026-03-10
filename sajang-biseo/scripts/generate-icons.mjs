/**
 * SVG → 고품질 PNG 아이콘 생성 (sharp 사용)
 * 실행: node scripts/generate-icons.mjs
 */

import sharp from "sharp";
import { readFileSync } from "fs";

const svgBuffer = readFileSync("public/icons/icon.svg");

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);

  console.log(`✓ icon-${size}x${size}.png`);
}

console.log("\nDone!");
