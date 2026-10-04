/**
 * Icon generator — pure Node, zero dependencies.
 * Renders the calf-face pictogram to RGBA raster (2× supersampled), encodes
 * PNG manually (zlib is built-in), and writes the PWA icon set.
 *
 * Run: npm run icons
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');

/* ---------- PNG encoding ---------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter: none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- raster painting (opaque "over" compositing) ---------- */

function fillEllipse(px, s, cx, cy, rx, ry, [r, g, b]) {
  const x0 = Math.max(0, Math.floor(cx - rx));
  const x1 = Math.min(s - 1, Math.ceil(cx + rx));
  const y0 = Math.max(0, Math.floor(cy - ry));
  const y1 = Math.min(s - 1, Math.ceil(cy + ry));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        const i = (y * s + x) * 4;
        px[i] = r;
        px[i + 1] = g;
        px[i + 2] = b;
        px[i + 3] = 255;
      }
    }
  }
}

function fillRoundRect(px, s, x0, y0, x1, y1, radius, [r, g, b]) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const halfW = (x1 - x0) / 2 - radius;
  const halfH = (y1 - y0) / 2 - radius;
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(s - 1, Math.ceil(y1)); y++) {
    for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(s - 1, Math.ceil(x1)); x++) {
      const qx = Math.abs(x + 0.5 - cx) - halfW;
      const qy = Math.abs(y + 0.5 - cy) - halfH;
      const dist =
        Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
        Math.min(Math.max(qx, qy), 0) -
        radius;
      if (dist < 0) {
        const i = (y * s + x) * 4;
        px[i] = r;
        px[i + 1] = g;
        px[i + 2] = b;
        px[i + 3] = 255;
      }
    }
  }
}

/* ---------- palette ---------- */

const GREEN = [22, 101, 52]; // #166534
const CREAM = [255, 247, 237]; // #FFF7ED
const PINK = [253, 164, 175]; // #FDA4AF
const MUZZLE = [254, 205, 211]; // #FECDD3
const PATCH = [180, 83, 9]; // #B45309
const DARK = [31, 41, 55]; // #1F2937
const NOSTRIL = [154, 52, 18]; // #9A3412

/**
 * Renders one icon at `size` px. Unit geometry lives in a 0..1 square,
 * content scaled into the maskable safe zone when requested.
 */
function render(size, { maskable }) {
  const s = size * 2; // 2× supersampling
  const px = new Float64Array(s * s * 4);

  if (maskable) {
    for (let i = 0; i < s * s; i++) {
      px[i * 4] = GREEN[0];
      px[i * 4 + 1] = GREEN[1];
      px[i * 4 + 2] = GREEN[2];
      px[i * 4 + 3] = 255;
    }
  } else {
    fillRoundRect(px, s, 0, 0, s, s, s * 0.18, GREEN);
  }

  const k = maskable ? 0.72 : 0.86; // content scale (maskable safe zone ≈ 80%)
  const T = (u) => (0.5 + (u - 0.5) * k) * s;
  const R = (u) => u * k * s;

  // ears (behind the head)
  fillEllipse(px, s, T(0.335), T(0.315), R(0.062), R(0.062), CREAM);
  fillEllipse(px, s, T(0.665), T(0.315), R(0.062), R(0.062), CREAM);
  // head
  fillEllipse(px, s, T(0.5), T(0.47), R(0.155), R(0.155), CREAM);
  // inner ears
  fillEllipse(px, s, T(0.335), T(0.315), R(0.032), R(0.032), PINK);
  fillEllipse(px, s, T(0.665), T(0.315), R(0.032), R(0.032), PINK);
  // forehead patch
  fillEllipse(px, s, T(0.5), T(0.375), R(0.055), R(0.045), PATCH);
  // eyes
  fillEllipse(px, s, T(0.445), T(0.44), R(0.018), R(0.018), DARK);
  fillEllipse(px, s, T(0.555), T(0.44), R(0.018), R(0.018), DARK);
  // muzzle + nostrils
  fillEllipse(px, s, T(0.5), T(0.545), R(0.085), R(0.062), MUZZLE);
  fillEllipse(px, s, T(0.465), T(0.545), R(0.014), R(0.014), NOSTRIL);
  fillEllipse(px, s, T(0.535), T(0.545), R(0.014), R(0.014), NOSTRIL);

  // 2×2 box downsample
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      for (let c = 0; c < 4; c++) {
        const sum =
          px[(y * 2 * s + x * 2) * 4 + c] +
          px[(y * 2 * s + x * 2 + 1) * 4 + c] +
          px[((y * 2 + 1) * s + x * 2) * 4 + c] +
          px[((y * 2 + 1) * s + x * 2 + 1) * 4 + c];
        out[(y * size + x) * 4 + c] = Math.round(sum / 4);
      }
    }
  }
  return encodePng(size, size, out);
}

mkdirSync(outDir, { recursive: true });

const targets = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'maskable-512.png', size: 512, maskable: true },
  { name: '../apple-touch-icon.png', size: 180, maskable: true },
];

for (const target of targets) {
  const png = render(target.size, { maskable: target.maskable });
  const path = join(outDir, target.name);
  writeFileSync(path, png);
  console.log(`written ${path} (${png.length} bytes)`);
}
