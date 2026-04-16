const fs = require('fs');
const path = require('path');

const insightsPath = path.join(__dirname, '../constants/insights.ts');
const insightsContent = fs.readFileSync(insightsPath, 'utf8');

const outputDir = path.join(__dirname, '../public/content/insights');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read and extract slugs and content
const regex = /slug:\s*'([^']+)'[\s\S]*?content:\s*`([\s\S]*?)`/g;
let match;
while ((match = regex.exec(insightsContent)) !== null) {
  const slug = match[1];
  const content = match[2].trim();
  fs.writeFileSync(path.join(outputDir, `${slug}.md`), content, 'utf8');
  console.log(`Wrote ${slug}.md`);
}

// Remove content from insights.ts
// Match: content:\s*`[\s\S]*?`
const newInsightsContent = insightsContent.replace(/,\s*content:\s*`[\s\S]*?`/g, '');
fs.writeFileSync(insightsPath, newInsightsContent, 'utf8');
console.log('Updated constants/insights.ts');
