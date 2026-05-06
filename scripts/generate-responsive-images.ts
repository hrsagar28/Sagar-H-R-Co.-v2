import { existsSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const publicImagesDir = path.resolve('public/images');
const sourceBaseName = 'founder-source';
const fallbackSource = path.join(publicImagesDir, 'founder.jpg');
const widths = [400, 800, 1080] as const;

type OutputFormat = 'avif' | 'webp' | 'jpg';

const formats: OutputFormat[] = ['avif', 'webp', 'jpg'];

async function findSource(): Promise<string> {
  const entries = await readdir(publicImagesDir);
  const source = entries.find((entry) => path.parse(entry).name === sourceBaseName);

  if (source) {
    return path.join(publicImagesDir, source);
  }

  if (existsSync(fallbackSource)) {
    return fallbackSource;
  }

  throw new Error(`No founder image source found. Expected ${sourceBaseName}.<ext> or founder.jpg in public/images.`);
}

async function isOutputFresh(sourcePath: string, outputPath: string): Promise<boolean> {
  if (!existsSync(outputPath)) return false;

  const [sourceStats, outputStats] = await Promise.all([stat(sourcePath), stat(outputPath)]);
  return outputStats.mtimeMs >= sourceStats.mtimeMs;
}

async function writeVariant(sourcePath: string, width: number, format: OutputFormat): Promise<void> {
  const outputPath = path.join(publicImagesDir, `founder-${width}.${format}`);

  if (await isOutputFresh(sourcePath, outputPath)) {
    console.log(`responsive-images: fresh ${path.relative(process.cwd(), outputPath)}`);
    return;
  }

  let pipeline = sharp(sourcePath).resize({ width, withoutEnlargement: true });

  if (format === 'avif') {
    pipeline = pipeline.avif({ quality: 50, effort: 6 });
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality: 75 });
  } else {
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true });
  }

  await pipeline.toFile(outputPath);
  console.log(`responsive-images: wrote ${path.relative(process.cwd(), outputPath)}`);
}

async function main() {
  const sourcePath = await findSource();

  for (const width of widths) {
    for (const format of formats) {
      await writeVariant(sourcePath, width, format);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
