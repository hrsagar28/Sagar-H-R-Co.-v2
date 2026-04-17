const fs = require('fs');
const path = require('path');
const https = require('https');

const outputDir = path.join(__dirname, '../public/images/hero');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const baseUrl = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab';

const formats = [
  { ext: 'avif', url: `${baseUrl}?q=80&w=1600&auto=format&fm=avif` },
  { ext: 'webp', url: `${baseUrl}?q=85&w=1600&auto=format&fm=webp` },
  { ext: 'jpg', url: `${baseUrl}?q=80&w=1600&auto=format&fm=jpg` }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  for (const format of formats) {
    const dest = path.join(outputDir, `home-hero-office.${format.ext}`);
    console.log(`Downloading ${format.ext}...`);
    try {
      await downloadFile(format.url, dest);
      console.log(`Saved ${dest}`);
    } catch (e) {
      console.error(e);
    }
  }
})();
