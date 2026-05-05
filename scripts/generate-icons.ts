import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const sourcePath = path.join(publicDir, 'favicon.svg');

const outputs = [
  { filename: 'favicon-16x16.png', size: 16 },
  { filename: 'favicon-32x32.png', size: 32 },
  { filename: 'apple-touch-icon.png', size: 180 },
  { filename: 'logo.png', size: 512 },
];

async function generateIcons() {
  await mkdir(publicDir, { recursive: true });

  const source = await readFile(sourcePath);

  await Promise.all(
    outputs.map(({ filename, size }) =>
      sharp(source).resize(size, size, { fit: 'contain' }).png().toFile(path.join(publicDir, filename)),
    ),
  );

  for (const { filename, size } of outputs) {
    console.log(`Generated public/${filename} (${size}x${size})`);
  }
}

generateIcons().catch((error) => {
  console.error('Failed to generate icon assets:', error);
  process.exitCode = 1;
});
