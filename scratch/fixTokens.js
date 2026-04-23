const fs = require('fs');
const files = [
  'pages/InsightDetail.tsx', 
  'pages/Resources/GSTCalculator.tsx', 
  'pages/Resources/ComplianceCalendar.tsx', 
  'pages/Resources/CIICalculator.tsx', 
  'pages/Home.tsx', 
  'pages/Contact-SurfaceLaptop7.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\[brand-accent\]/g, 'brand-accent');
  if (f === 'pages/InsightDetail.tsx') {
    content = content.replace(/stroke="brand-accent"/g, 'stroke="#4ade80"');
  }
  fs.writeFileSync(f, content);
});
console.log('Fixed token braces.');
